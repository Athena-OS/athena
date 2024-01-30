{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-akame-theme";
  version = "unstable-2024-01-29";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-akame-theme";
    rev = "e502d0994fe2a3ea3bda0d92d0cbdb2dcf207ec5";
    hash = "sha256-UxS+xDMHL/BNn2NO8HuQRFKA6Nid8KbwixCjJi6d+Ms=";
  };

  installPhase = ''
    mkdir -p $out/share/{icons/hicolor/scalable/{apps,categories},backgrounds/athena}
    cp -r icons/apps/* $out/share/icons/hicolor/scalable/apps/
    cp -r icons/categories/* $out/share/icons/hicolor/scalable/categories/
    cp -r akame.jpg $out/share/backgrounds/athena/
  '';

  meta = with lib; {
    description = "Akame theme resources";
    homepage = "https://github.com/Athena-OS/athena-akame-theme";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})