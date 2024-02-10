{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-gruvbox-base";
  version = "0-unstable-2024-02-10";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-gruvbox-base";
    rev = "61da69842c2c67177263e021b3ea3ca5cbc4a227";
    hash = "sha256-ddVw7xp8U5JTmArAEhWdAJj1LnUHGLHxqV0Q6y+RWrM=";
  };

  installPhase = ''
    mkdir -p $out/share/{icons/hicolor/scalable/{apps,categories},backgrounds/athena}
    cp -r icons/apps/* $out/share/icons/hicolor/scalable/apps/
    cp -r icons/categories/* $out/share/icons/hicolor/scalable/categories/
    cp -r cyborg-gruv.png $out/share/backgrounds/athena/
  '';

  meta = with lib; {
    description = "Gruvbox colorbase resources";
    homepage = "https://github.com/Athena-OS/athena-gruvbox-base";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})