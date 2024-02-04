{ lib
, rustPlatform
, fetchFromGitHub
, stdenv
, darwin
, openssl
}:

rustPlatform.buildRustPackage {
  pname = "aegis-nix";
  version = "unstable-2024-01-24";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "aegis-nix";
    rev = "f166dbf25f6825e47093fbed6ac01afc4ea54cfa";
    hash = "sha256-EGTPoFOqjc7sj6BixLGHgwNHyE+lxPuAQ0kWoF9n1xM=";
  };

  cargoHash = "sha256-mBYZr/b62T6UMD3vnm/M6WI7yCY+8W2BOb2rrchKITo=";

  buildInputs = lib.optionals stdenv.isDarwin [
    darwin.apple_sdk.frameworks.Security
  ];

  postPatch = ''
    substituteInPlace src/functions/users.rs \
      --replace "\"openssl\"" "\"${openssl}/bin/openssl\""
  '';

  meta = with lib; {
    description = "Aegis - secure, rust-based installer back-end for Athena OS";
    mainProgram = "athena-aegis";
    homepage = "https://github.com/Athena-OS/aegis-nix";
    license = licenses.gpl3Plus;
    maintainers = with maintainers; [ d3vil0p3r ];
  };
}