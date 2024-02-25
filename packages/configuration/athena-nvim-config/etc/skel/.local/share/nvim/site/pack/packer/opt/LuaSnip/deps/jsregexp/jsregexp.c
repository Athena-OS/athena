#define LUA_LIB

#include <lauxlib.h>
#include <lua.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "cutils.h"
#include "libregexp.h"

#define CAPTURE_COUNT_MAX 255  /* from libregexp.c */

#if LUA_VERSION_NUM >= 502
#define new_lib(L, l) (luaL_newlib(L, l))
#define lua_tbl_len(L, arg) (lua_rawlen(L, arg))
#else
#define new_lib(L, l) (lua_newtable(L), luaL_register(L, NULL, l))
#define lua_tbl_len(L, arg) (lua_objlen(L, arg))
#endif

#if LUA_VERSION_NUM < 503
#define lua_pushinteger(L, n) lua_pushinteger(L, n)
#endif

struct regexp {
  char* expr;
  uint8_t *bc;
};


// check for bytes higher or equal to 0xf0
static inline bool utf8_contains_non_bmp(const char *s)
{
  uint8_t *q = (uint8_t *) s;
  while (*q) {
    if ((*q++ & 0xf0) == 0xf0) {
      return true;
    }
  }
  return false;
}


static inline bool utf8_contains_non_ascii(const char *s)
{
  while (*s) {
    if (*s++ & 0x80) {
      return true;
    }
  }
  return false;
}


// returns NULL when malformed unicode is encountered, otherwise returns the
// converted string. *utf16_len will contain the length of the string and
// *indices an (allocated) array mapping each utf16 code point to the utf8 code
// point in the input string.
static inline uint16_t *utf8_to_utf16(
    const uint8_t *input,
    uint32_t n,
    uint32_t *utf16_len,
    uint32_t **indices)
{
  *indices = calloc((n+1), sizeof *indices);
  uint16_t *str = malloc((n+1) * sizeof *str);
  uint16_t *q = str;

  const uint8_t *pos = input;
  while (*pos) {
    (*indices)[q-str] = pos - input;
    int c = unicode_from_utf8(pos, UTF8_CHAR_LEN_MAX, &pos);
    if (c == -1) {
      // malformed
      free(str);
      free(*indices);
      return NULL;
    }
    if ((unsigned) c > 0xffff) {
      *q++ = (((c - 0x10000) >> 10) | (0xd8 << 8));
      *q++ = (c & 0xfffff) | (0xdc << 8);
    } else {
      *q++ = c & 0xffff;
    }
  }
  *q = 0;
  (*indices)[q - str] = n;

  *utf16_len = q - str;
  return str;
}


static int regexp_call(lua_State *lstate)
{
  uint8_t *capture[CAPTURE_COUNT_MAX * 2];

  struct regexp *r = luaL_checkudata(lstate, 1, "jsregexp_meta");
  const int global = lre_get_flags(r->bc) & LRE_FLAG_GLOBAL;
  const int named_groups = lre_get_flags(r->bc) & LRE_FLAG_NAMED_GROUPS;
  const int capture_count = lre_get_capture_count(r->bc);

  const uint8_t *input = (uint8_t *) luaL_checkstring(lstate, 2);
  const int input_len = strlen((char *) input);

  int nmatch = 0;
  int cindex = 0;

  if (utf8_contains_non_ascii((char *) input)) {
    uint32_t *indices;
    uint32_t input_utf16_len;
    uint16_t *input_utf16 = utf8_to_utf16(input, input_len, &input_utf16_len, &indices);

    if (!input_utf16) {
      lua_pushnil(lstate);
      lua_pushstring(lstate, "malformed unicode");
      return 2;
    }

    lua_newtable(lstate);
    while (lre_exec(capture, r->bc, (uint8_t *) input_utf16, cindex, input_utf16_len, 1, NULL) == 1) {
      if (capture[0] == capture[1]) {
        // empty match -> continue matching from next character (to prevent an endless loop).
        // This is basically the same implementation as in quickjs, see
        // https://github.com/bellard/quickjs/blob/2788d71e823b522b178db3b3660ce93689534e6d/quickjs.c#L42857-L42869

        cindex++;
        if ((*(input_utf16 + cindex) >> 10) == 0x37) {
          // surrogate pair (vscode doesn't always do this?)
          cindex++;
        }
      } else {
        cindex = (capture[1] - (uint8_t *) input_utf16) / 2;
      }

      lua_newtable(lstate);

      lua_pushnumber(lstate, 1 + indices[(capture[0] - (uint8_t *) input_utf16) / 2]);
      lua_setfield(lstate, -2, "begin_ind");

      lua_pushnumber(lstate, indices[(capture[1] - (uint8_t *) input_utf16) / 2]);
      lua_setfield(lstate, -2, "end_ind");

      lua_newtable(lstate);

      const char* group_names = NULL;
      if (named_groups) {
        lua_newtable(lstate);
        group_names = lre_get_groupnames(r->bc);
      }
      for (int i = 1; i < capture_count; i++) {
        const uint32_t a = indices[(capture[2*i] - (uint8_t *) input_utf16) / 2];
        const uint32_t b = indices[(capture[2*i+1] - (uint8_t *) input_utf16) / 2];
        lua_pushlstring(lstate, (char *) input+a, b-a);
        lua_rawseti(lstate, -2, i);
        if (named_groups && group_names != NULL) {
          if (*group_names != '\0') { // check if current group is named
            lua_pushlstring(lstate, (char *) input+a, b-a);
            lua_setfield(lstate, -3, group_names);
            group_names += strlen(group_names) + 1;  // move to the next group name
          } else {
            group_names += 1; // move to the next group name
          }
        }
      }

      if (named_groups) {
        lua_setfield(lstate, -3, "groups");
        lua_setfield(lstate, -2, "named_groups");
      } else {
        lua_setfield(lstate, -2, "groups");
      }

      lua_rawseti(lstate, -2, ++nmatch);

      if (!global || cindex > input_utf16_len) {
        break;
      }
    }

    free(input_utf16);
    free(indices);
  } else {
    lua_newtable(lstate);
    while (lre_exec(capture, r->bc, input, cindex, input_len, 0, NULL) == 1) {
      if (capture[0] == capture[1]) {
        cindex++;
      } else {
        cindex = capture[1] - input;
      }

      lua_newtable(lstate);

      lua_pushnumber(lstate, 1 + capture[0] - input);
      lua_setfield(lstate, -2, "begin_ind");

      lua_pushnumber(lstate, capture[1] - input);
      lua_setfield(lstate, -2, "end_ind");

      lua_newtable(lstate);

      const char* group_names = NULL;
      if (named_groups) {
        lua_newtable(lstate);
        group_names = lre_get_groupnames(r->bc);
      }
      for (int i = 1; i < capture_count; i++) {
        lua_pushlstring(lstate, (char *) capture[2 * i], capture[2 * i + 1] - capture[2 * i]);
        lua_rawseti(lstate, -2, i);
        if (named_groups && group_names != NULL) {
          if (*group_names != '\0') { // check if current group is named
            lua_pushlstring(lstate, (char *) capture[2 * i], capture[2 * i + 1] - capture[2 * i]);
            lua_setfield(lstate, -3, group_names);
            group_names += strlen(group_names) + 1;  // move to the next group name
          } else {
            group_names += 1; // move to the next group name
          }
        }
      }

      if (named_groups) {
        lua_setfield(lstate, -3, "groups");
        lua_setfield(lstate, -2, "named_groups");
      } else {
        lua_setfield(lstate, -2, "groups");
      }

      lua_rawseti(lstate, -2, ++nmatch);

      if (!global || cindex > input_len) {
        break;
      }
    }
  }
  return 1;
}


static int regexp_gc(lua_State *lstate)
{
  struct regexp *r = lua_touserdata(lstate, 1);
  free(r->bc);
  free(r->expr);
  return 0;
}


static int regexp_tostring(lua_State *lstate)
{
  struct regexp *r = luaL_checkudata(lstate, 1, "jsregexp_meta");
  const int flags = lre_get_flags(r->bc);

  const char* ignorecase = (flags & LRE_FLAG_IGNORECASE) ? "i" : "";
  const char* global = (flags & LRE_FLAG_GLOBAL) ? "g" : "";
  const char* named_groups = (flags & LRE_FLAG_NAMED_GROUPS) ? "n" : "";
  const char* utf16 = (flags & LRE_FLAG_UTF16) ? "u" : "";

  lua_pushfstring(lstate, "jsregexp: /%s/%s%s%s%s", r->expr, ignorecase, global, named_groups, utf16);
  return 1;
}


static struct luaL_Reg jsregexp_meta[] = {
  {"__gc", regexp_gc},
  {"__call", regexp_call},
  {"__tostring", regexp_tostring},
  {NULL, NULL}
};


static int jsregexp_compile(lua_State *lstate)
{
  char error_msg[64];
  int len, re_flags = 0;

  const char *regexp = luaL_checkstring(lstate, 1);

  // lre_compile can segfault if the input contains 0x8f, which
  // indicated the beginning of a six byte sequence, but is now illegal.
  if (strchr(regexp, 0xfd)) {
    lua_pushnil(lstate);
    lua_pushstring(lstate, "malformed unicode");
    return 2;
  }

  if (!lua_isnoneornil(lstate, 2)) {
    const char *flags = luaL_checkstring(lstate, 2);
    while (*flags) {
      switch (*(flags++)) {
        case 'i': re_flags |= LRE_FLAG_IGNORECASE; break;
        case 'g': re_flags |= LRE_FLAG_GLOBAL; break;
        case 'n': re_flags |= LRE_FLAG_NAMED_GROUPS; break;
        default: /* unknown flag */;
      }
    }
  }

  if (utf8_contains_non_bmp(regexp)) {
    // bmp range works fine without utf16 flag
    re_flags |= LRE_FLAG_UTF16;
  }

  uint8_t *bc = lre_compile(&len, error_msg, sizeof error_msg, regexp,
      strlen(regexp), re_flags, NULL);

  if (!bc) {
    lua_pushnil(lstate);
    lua_pushstring(lstate, error_msg);
    return 2;
  }

  struct regexp *ud = lua_newuserdata(lstate, sizeof *ud);
  ud->bc = bc;
  ud->expr = strdup(regexp);

  luaL_getmetatable(lstate, "jsregexp_meta");
  lua_setmetatable(lstate, -2);

  return 1;
}


static const struct luaL_Reg jsregexp_lib[] = {
  {"compile", jsregexp_compile},
  {NULL, NULL}
};


int luaopen_jsregexp(lua_State *lstate)
{
  new_lib(lstate, jsregexp_lib);
  luaL_newmetatable(lstate, "jsregexp_meta");
#if LUA_VERSION_NUM >= 502
  luaL_setfuncs(lstate, jsregexp_meta, 0);
#else
  luaL_register(lstate, NULL, jsregexp_meta);
#endif
  lua_pop(lstate, 1);
  return 1;
}
