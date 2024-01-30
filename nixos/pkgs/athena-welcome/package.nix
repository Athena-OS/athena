{ lib
, stdenvNoCC
, fetchFromGitHub
, runtimeShell
, python3
, gobject-introspection
, libwnck
, glib
, gtk3
, python311Packages
, wrapGAppsHook
}:

stdenvNoCC.mkDerivation {
  pname = "athena-welcome";
  version = "unstable-2024-01-20";

  src = fetchFromGitHub {
    owner = "Athena-OS";
    repo = "athena-welcome";
    rev = "f83a35775d24c205b4809ee0546545df79c16a63";
    hash = "sha256-GhGqIhlwpag4uNHksAgEn3QRbxrPXXOfoCguAIVNaZA=";
  };

  nativeBuildInputs = [ gobject-introspection wrapGAppsHook ];
  buildInputs = [ glib gtk3 libwnck ];
  propagatedBuildInputs = [ python311Packages.pygobject3 ];

  makeWrapperArgs = [
    "--set GI_TYPELIB_PATH \"$GI_TYPELIB_PATH\""
  ];

  #postPatch = ''
  #  patchShebangs athena-welcome
  #'';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/{bin,share/athena-welcome}
    cp -r assets $out/share/athena-welcome/
    cp -r src/* $out/share/athena-welcome/
    cat > "$out/bin/athena-welcome" << EOF
    #!${runtimeShell}
    exec ${python3}/bin/python $out/share/athena-welcome/athena-welcome.py "\$@"
    EOF
    chmod u+x "$out/bin/athena-welcome"
    runHook postInstall
  '';

  meta = with lib; {
    description = "Athena Welcome application";
    mainProgram = "athena-welcome";
    homepage = "https://github.com/Athena-OS/athena-welcome";
    maintainers = with maintainers; [ d3vil0p3r ];
    platforms = platforms.unix;
    license = licenses.gpl3Plus;
  };
}
