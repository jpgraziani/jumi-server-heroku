CREATE TABLE recipes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    created TIMESTAMPTZ DEFAULT now() NOT NULL,
    directions TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    main_protein TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL
);

