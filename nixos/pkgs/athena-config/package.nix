{ lib
, stdenvNoCC
, fetchFromGitHub
, pciutils
, bash
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "athena-config";
  version = "unstable-2024-01-27";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-config";
    rev = "dc20b1ccdd566c2cdde1378290b2327585413e9f";
    hash = "sha256-xqRZxbDLwDM3SUfNjNCcwClxfdSqjDotUSJJwzMLj+Q=";
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
