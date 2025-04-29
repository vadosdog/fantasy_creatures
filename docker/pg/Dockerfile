FROM postgres:16 as build
RUN apt-get update && apt-get install -y postgresql-server-dev-10 git make g++ && \
    git clone https://github.com/iCyberon/pg_hashids.git && \
    cd pg_hashids && \
    make && \
    make install && \
    rm -rf /var/lib/apt/lists/*

FROM postgres:16
RUN apt-get update && apt-get install -y postgresql-10-postgis-2.4 && rm -rf /var/lib/apt/lists/*
COPY --from=build /pg_hashids/pg_hashids.so /usr/lib/postgresql/10/lib/
COPY --from=build /pg_hashids/pg_hashids.control /usr/share/postgresql/10/extension/
COPY --from=build /pg_hashids/*.sql /usr/share/postgresql/10/extension/
