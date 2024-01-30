{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-cyborg-theme";
  version = "unstable-2024-01-29";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-cyborg-theme";
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
    description = "Cyborg theme resources";
    homepage = "https://github.com/Athena-OS/athena-cyborg-theme";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})