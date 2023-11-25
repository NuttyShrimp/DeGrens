{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.devshell.url = "github:numtide/devshell";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, flake-utils, devshell, nixpkgs, ... }:
    flake-utils.lib.eachDefaultSystem (system: 
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            permittedInsecurePackages = [
              "nodejs-16.20.2"
            ];
          };

          overlays = [ devshell.overlays.default ];
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_16
            nodePackages.pnpm
            nodePackages.prisma
            libmysqlclient
            zlib
            python311
            python311Packages.gitpython
          ];
          shellHook = ''
            export PRISMA_QUERY_ENGINE_LIBRARY=${pkgs.prisma-engines}/lib/libquery_engine.node
            export PRISMA_QUERY_ENGINE_BINARY=${pkgs.prisma-engines}/bin/query-engine
            export PRISMA_SCHEMA_ENGINE_BINARY=${pkgs.prisma-engines}/bin/schema-engine
          '';
        };
      }
    );
}