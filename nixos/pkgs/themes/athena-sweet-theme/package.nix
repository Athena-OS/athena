{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-sweet-theme";
  version = "unstable-2024-01-14";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-sweet-theme";
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
    description = "Sweet Dark theme resources";
    homepage = "https://github.com/Athena-OS/athena-sweet-theme";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})
