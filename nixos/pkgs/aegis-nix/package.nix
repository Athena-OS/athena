{ lib
, rustPlatform
, fetchFromGitHub
, stdenv
, darwin
, openssl
}:

rustPlatform.buildRustPackage {
  pname = "aegis-nix";
  version = "unstable-2024-02-05";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "aegis-nix";
    rev = "63c85ebea16663324db45e26707e9dbc2a57fd00";
    hash = "sha256-6wYWtSDGnqWz5elbXq2GoxpJl4MDBq1r7S6KnmmsH+U=";
  };

  cargoHash = "sha256-B/vJh9ii90klnlDxAmIkkVqfa9tDjkJqFF61kIh+RhM=";

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