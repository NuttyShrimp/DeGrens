{
  inputs.devshell.url = "github:numtide/devshell";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  inputs.flake-compat = {
    url = "github:edolstra/flake-compat";
    flake = false;
  };

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
      with pkgs; {
        devShell = mkShell {
          buildInputs = [
            nodejs_16
            nodePackages.pnpm
            nodePackages.prisma
            libmysqlclient
            zlib
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