local api = require "mason-registry.api"

---@type Provider
return {
    github = {
        get_latest_release = function(repo, opts)
            opts = opts or {}
            return api.repo.releases.latest({ repo = repo }, {
                params = {
                    include_prerelease = (opts and opts.include_prerelease) and "true" or "false",
                },
            })
        end,
        get_all_release_versions = function(repo)
            return api.repo.releases.all { repo = repo }
        end,
        get_latest_tag = function(repo)
            return api.repo.tags.latest { repo = repo }
        end,
        get_all_tags = function(repo)
            return api.repo.tags.all { repo = repo }
        end,
    },
    npm = {
        get_latest_version = function(pkg)
            return api.npm.versions.latest { package = pkg }
        end,
        get_all_versions = function(pkg)
            return api.npm.versions.all { package = pkg }
        end,
    },
    pypi = {
        get_latest_version = function(pkg)
            return api.pypi.versions.latest { package = pkg }
        end,
        get_all_versions = function(pkg)
            return api.pypi.versions.all { package = pkg }
        end,
    },
    rubygems = {
        get_latest_version = function(gem)
            return api.rubygems.versions.latest { gem = gem }
        end,
        get_all_versions = function(gem)
            return api.rubygems.versions.all { gem = gem }
        end,
    },
}
