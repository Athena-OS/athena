{ lib
, rustPlatform
, fetchFromGitHub
, stdenv
, darwin
, coreutils
, gzip
}:

rustPlatform.buildRustPackage {
  pname = "cyber-toolnix";
  version = "unstable-2024-01-15";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "cyber-toolnix";
    rev = "cc30742f39d2a4ede201c6b2d115d25a107d51b4";
    hash = "sha256-+M8pQrF1ZuKX6IUC+Kx9tgh39cRGmrglarRYEx++3hA=";
  };

  cargoHash = "sha256-HixaHr4nkKyNtLN01BRsBJsEPu11k8sFVZjERU80+CM=";

  buildInputs = lib.optionals stdenv.isDarwin [
    darwin.apple_sdk.frameworks.Security
  ];

  propagateBuildInputs = [
    coreutils
    gzip
  ];

  postPatch = ''
    substituteInPlace src/utils.rs \
      --replace "\"base64\"" "\"${coreutils}/bin/base64\"" \
      --replace "\"gunzip\"" "\"${gzip}/bin/gunzip\""
  '';

  meta = with lib; {
    description = "Set your Cyber Security role";
    mainProgram = "cyber-toolnix";
    homepage = "https://github.com/Athena-OS/cyber-toolnix";
    license = licenses.gpl3Plus;
    maintainers = with maintainers; [ d3vil0p3r ];
  };
}
