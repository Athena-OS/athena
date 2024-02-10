{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-cyan-base";
  version = "0-unstable-2024-02-10";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-cyan-base";
    rev = "75dab76d0f3ef0b4293e730d883dd2e643cdfae8";
    hash = "sha256-VvOWXqFmDzAadjBayLPmJsDZJ7myCKs/1E+uYzfWs2s=";
  };

  installPhase = ''
    mkdir -p $out/share/{icons/hicolor/scalable/{apps,categories},backgrounds/athena}
    cp -r icons/apps/* $out/share/icons/hicolor/scalable/apps/
    cp -r icons/categories/* $out/share/icons/hicolor/scalable/categories/
    cp -r samurai-girl.jpg $out/share/backgrounds/athena/
  '';

  meta = with lib; {
    description = "Cyan colorbase resources";
    homepage = "https://github.com/Athena-OS/athena-cyan-base";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})