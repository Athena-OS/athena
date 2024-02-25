#python-yara and python-yara-rednaga conflict
apkid
python-yara-rednaga
ssma

##depending on apkid
mobsf
quickscope

#mariadb-libs and libmariadb-client conflict
argus-clients
qt3
xplico

#mysql and mariadb-client conflict
smartphone-pentest-framework (deprecated, should be removed from BA)

##depending on qt3
pyqt3
qscintilla-qt3

##depending on pyqt3
faradaysec
gerix-wifi-cracker
inguma

#mariadb-libs and libsqlclient conflict
braces
facebrok

#fuzzdb conflict packages
fuzzdb

#error: pfff: signature from "Jürgen Hötzel (Arch Linux developer key) <juergen@archlinux.org>" is marginal trust
:: File /var/cache/pacman/pkg/pfff-0.29-9-x86_64.pkg.tar.xz is corrupted (invalid or corrupted package (PGP signature)).
Do you want to delete it? [Y/n] error: failed to commit transaction (invalid or corrupted package)
pfff

## depending on python-flask-cors and python-flask-socketio but these two deps in BA are wrongly a clone of Python2 deps
trape
