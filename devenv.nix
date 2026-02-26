{ pkgs, ... }:
let
  projectName = "otherworld-codex";
  pgHost = "localhost";
  pgUser = "postgres";
  pgPassword = "postgres";
  pgPort = "5434";
in
{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  languages.go.enable = true;

  packages = with pkgs; [
    sqlc
    just
    postgresql
    watchexec
  ];

  dotenv.enable = true;

  env = rec {
    PGHOST = pgHost;
    PGUSER = pgUser;
    PGPASSWORD = pgPassword;
    PGDATABASE = projectName;
    PGPORT = pgPort;

    POSTGRES_USER = PGUSER;
    POSTGRES_PASSWORD = PGPASSWORD;
    POSTGRES_DB = PGDATABASE;
    POSTGRES_PORT = PGPORT;

    DATABASE_URL = "postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=disable";

    ENV = "development";
  };

  processes.postgres = {
    exec = "docker compose up postgres";
    process-compose.readiness_probe = {
      exec.command = "pg_isready -h $PGHOST -U $PGUSER -d $PGDATABASE";
      initial_delay_seconds = 1;
      period_seconds = 2;
    };
  };

  tasks."fetch:cards" = {
    exec = "test -f data/cards.json || just fetch-cards";
    before = [ "devenv:processes:server" ];
  };

  tasks."db:seed" = {
    exec = "just db-seed";
    after = [ "fetch:cards" ];
    before = [ "devenv:processes:server" ];
  };

  processes.server = {
    exec = "watchexec -r -e go -d 500 --stop-signal SIGINT -- go run ./cmd/server";
    process-compose.depends_on.postgres.condition = "process_healthy";
  };

  processes.web = {
    exec = "npm --prefix web run dev";
    process-compose.depends_on.server.condition = "process_started";
  };
}
