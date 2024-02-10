{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-purple-base";
  version = "0-unstable-2024-02-10";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-purple-base";
    rev = "d2223e51d153315c3f773ccbc406edb04eb0c114";
    hash = "sha256-0gyg5pXsfdfIdMW7CeXwDc05/c0Jp252A+Ck/WSWqXc=";
  };

  installPhase = ''
    mkdir -p $out/share/{icons/hicolor/scalable/{apps,categories},backgrounds/athena,themes}
    cp -r icons/apps/* $out/share/icons/hicolor/scalable/apps/
    cp -r icons/categories/* $out/share/icons/hicolor/scalable/categories/
    cp -r neon-circle.jpg nix-neon-circle.jpg $out/share/backgrounds/athena/
  '';

  meta = with lib; {
    description = "Purple colorbase resources";
    homepage = "https://github.com/Athena-OS/athena-purple-base";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})