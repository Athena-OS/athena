.DEFAULT_GOAL := test

NEOVIM_BRANCH := master

FILTER=.*

NEOVIM := neovim-$(NEOVIM_BRANCH)

.PHONY: neovim
neovim: $(NEOVIM)

$(NEOVIM):
	git clone --depth 1 https://github.com/neovim/neovim --branch $(NEOVIM_BRANCH) $@
	make -C $@

export VIMRUNTIME=$(PWD)/$(NEOVIM)/runtime

.PHONY: test
test: $(NEOVIM)
	$(NEOVIM)/.deps/usr/bin/busted \
		-v \
		--lazy \
		--helper=$(PWD)/test/preload.lua \
		--output test.busted.outputHandlers.nvim \
		--lpath=$(PWD)/$(NEOVIM)/?.lua \
		--lpath=$(PWD)/$(NEOVIM)/build/?.lua \
		--lpath=$(PWD)/$(NEOVIM)/runtime/lua/?.lua \
		--lpath=$(PWD)/?.lua \
		--lpath=$(PWD)/lua/?.lua \
		--filter=$(FILTER) \
		$(PWD)/test

	-@stty sane
