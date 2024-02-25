#!/usr/bin/env bash

create_vim_doc() (
	local project_name="${1:?}"
	local target="${2:?}"
	local template="${3:?}"
	local cur_dir
	cur_dir="$(pwd)"

	if [[ -d "${target}" ]]; then
		cp "${template}" "${TMP_DIR}/ldoc.ltp" || return 1
	else
		echo "No such template exists"
		return 1
	fi

	if [[ -d "${target}" ]]; then
		ldoc -p "${project_name}" -t "${project_name} Docs" -u "${target}" -l "${TMP_DIR}" -d "${TMP_DIR}" --date "- $(date +'%B')" || cleanup
		cd "${TMP_DIR}/modules" || exit 1
		cat "${project_name}".html "${project_name}"*.*.html >"${project_name}".txt || cleanup
	elif [[ -f "${target}" ]]; then
		ldoc -p "${project_name}" -t "${project_name} Docs" -u "${target}" -l "${TMP_DIR}" -d "${TMP_DIR}" --date "- $(date +'%B')" || cleanup
		cd "${TMP_DIR}" || exit 1
		cat index.html >"${project_name}".txt || cleanup
	else
		echo "Invalid target"
		return 1
	fi
	echo "vim:tw=80:ts=8:noet:ft=help:norl:" >>"${project_name}".txt
	# format each line to be within 80 columns
	# replace <pre> and </pre> with > and < respectively
	# Sometimes running the command one time is not enough, reason unknown
	nvim --headless +"set tw=80" \
		+'%norm gqq' \
		+'%norm gqq' \
		+'%s/<pre>/>/g' \
		+'%s/<\/pre>/</g' \
		"${project_name}".txt \
		+"wqa" || {
		echo "Coundn't format with nvim, but help file be placed"
	}
	mkdir -p "${cur_dir}/doc"
	cp "${project_name}".txt "${cur_dir}/doc/${project_name}.txt" || cleanup
	echo
	echo "${cur_dir}/doc/${project_name}.txt" created

	return 0
)

main() {
	TMP_DIR="$(mktemp -d)"

	cleanup() { rm -rf "${TMP_DIR}" exit 0; }

	project_name="colorizer"
	if command -v ldoc 1>/dev/null; then
		# html docs
		ldoc -f discount -p "${project_name}" -t "${project_name} Docs" -u lua "${@}" -s doc --date "- $(date +'%B')" || cleanup

		# vim docs
		create_vim_doc "${project_name}" lua doc/ldoc_vim.ltp || cleanup
	else
		echo "Error: Install ldoc first"
	fi

	cleanup
}

main "${@}"
