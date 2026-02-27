{ pkgs, ... }:
{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  packages = with pkgs; [
    just
  ];

  dotenv.enable = true;

  processes.web = {
    exec = "just dev";
  };
}
