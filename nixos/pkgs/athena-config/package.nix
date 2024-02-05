{ lib
, stdenvNoCC
, fetchFromGitHub
, pciutils
, bash
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-config";
  version = "unstable-2024-02-05";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-config";
    rev = "72ac6b1ca46856921e974ca48ecd9deb31d9a55c";
    hash = "sha256-Bvb2ewXS+fqQIl9ZOpD+deLEVxK9aKItuEzpSQqqL70=";
  };

  buildInputs = [ pciutils ];

  postPatch = ''
    patchShebangs athena-motd shell-rocket troubleshoot
  '';

  installPhase = ''
    mkdir -p $out/{bin,share}
    cp -r bin/* $out/bin/
    cp -r share/* $out/share/
  '';

  meta = with lib; {
    description = "Athena OS environment files";
    homepage = "https://github.com/Athena-OS/athena-config";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
})
