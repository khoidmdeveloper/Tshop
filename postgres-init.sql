SELECT 'CREATE DATABASE tshop' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tshop')\gexec
SELECT 'CREATE DATABASE tshop_auth' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tshop_auth')\gexec
SELECT 'CREATE DATABASE tshop_catalog' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tshop_catalog')\gexec
SELECT 'CREATE DATABASE tshop_order' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tshop_order')\gexec
