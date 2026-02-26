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
    exec = "npm --prefix web run dev";
  };
}
