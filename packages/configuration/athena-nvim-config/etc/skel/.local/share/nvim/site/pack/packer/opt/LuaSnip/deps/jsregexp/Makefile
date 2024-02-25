# This file is meant for testing locally, it is not used by luarocks.

TARGET = jsregexp.so
SOURCES = jsregexp.c cutils.c libregexp.c libunicode.c
OBJECTS = $(SOURCES:%.c=%.o)
INCLUDE_DIR = -I/usr/include/lua5.1
LDLIBS = -llua5.1
LDFLAGS = -shared
CFLAGS = $(INCLUDE_DIR) -O2 -fPIC
CC = gcc

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(LDFLAGS) $^ $(LDLIBS) -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $^ -o $@

check:
	lua5.1 test.lua
	luajit test.lua

clean:
	rm -f *.o *.so
