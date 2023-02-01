# degrens-main

## Cloning:

```
git clone https://gitlab.pieter557.dscloud.me/degrens-qb/degrens-main.git
git submodule init
git submodule update
git lfs pull
git submodule foreach --recursive git lfs pull
```

## Submodules en al
https://git-scm.com/book/nl/v2/Git-Tools-Submodules

```
cd resources\[submodule\
git fetch
git merge origin/master
```
Of
```
git submodule update
```

Last van dirty Submodules?
```
git submodule foreach --recursive git reset --hard
```
