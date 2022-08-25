#!/bin/bash

set -e
set -u

# taken from: https://stackoverflow.com/a/60190760/3542461
# with some edits
function git_sparse_checkout {
    # git repository, e.g.: http://github.com/frgomes/bash-scripts
    local url=$1
    # directory where the repository will be downloaded, e.g.: ./build/sources
    local dir=$2
    # repository name, in general taken from the url, e.g.: bash-scripts
    local prj=$3
    # tag, e.g.: master
    local tag=$4
    [[ ( -z "$url" ) || ( -z "$dir" ) || ( -z "$prj" ) || ( -z "$tag" ) ]] && \
        echo "ERROR: git_sparse_checkout: invalid arguments" && \
        return 1
    shift; shift; shift; shift

    # Note: any remaining arguments after these above are considered as a
    # list of files or directories to be downloaded.

    mkdir -p ${dir}
    if [ ! -d ${dir}/${prj} ] ;then
        mkdir -p ${dir}/${prj}
        pushd ${dir}/${prj}
        git init
        git config core.sparseCheckout true
        local path="" # local scope
        for path in $* ;do
            echo "${path}" >> .git/info/sparse-checkout
        done
        git remote add origin ${url}
        git fetch --depth=1 origin ${tag}
        git checkout ${tag}
        popd
    else
        pushd ${dir}/${prj}
        git fetch --depth=1 origin ${tag}
        git reset --hard origin/${tag}
        popd
    fi
}

function download_needed_files {
  url=https://github.com/invertase/notifee.git
  dir=$(pwd)/node_modules/@notifee/
  prj=core
  tag=main
  git_sparse_checkout $url $dir $prj $tag \
      "android/*";
} 

download_needed_files;
