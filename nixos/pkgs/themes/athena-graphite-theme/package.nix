{ lib
, stdenvNoCC
, fetchFromGitHub
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-graphite-theme";
  version = "unstable-2024-01-10";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-graphite-theme";
    rev = "8670ec2a528bf83828e7fa0d1b9890ed0c24db7b";
    hash = "sha256-KZoyD4e7FhpO9auczTt7ZaOcp1mfSVlQHG9/9t7k3jA=";
  };

  installPhase = ''
    mkdir -p $out/share/{icons/hicolor/scalable/{apps,categories},backgrounds/athena}
    cp -r icons/apps/* $out/share/icons/hicolor/scalable/apps/
    cp -r icons/categories/* $out/share/icons/hicolor/scalable/categories/
    cp -r nix-behind.png $out/share/backgrounds/athena/
  '';

  meta = with lib; {
    description = "Graphite Dark theme resources";
    homepage = "https://github.com/Athena-OS/athena-graphite-theme";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})
