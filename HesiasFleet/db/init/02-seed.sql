--
-- PostgreSQL database dump
--

\restrict f39jEqiXH433FQ8sNsXl9smMUh4bHxhhYPJvqveD54ekPzphcg2w45KlTh1Ej4a

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Vehicles; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."Vehicles" VALUES (1, NULL, 'AB-123-CD', NULL, 'Renault', 'Clio V', 50000) ON CONFLICT DO NOTHING;


--
-- Data for Name: MetaOperations; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."MetaOperations" VALUES (1, '2026-07-16 15:00:00+00', 46000, 'Vidange moteur', NULL, 76000, 1) ON CONFLICT DO NOTHING;


--
-- Data for Name: Operations; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."Operations" VALUES (1, '2026-07-16 10:00:00+00', 45000, 'Remplacement filtre à huile', NULL, 65000, 1, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."Operations" VALUES (2, '2026-07-16 10:00:00+00', 45000, 'Remplacement filtre à huile', NULL, 65000, 1, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."Operations" VALUES (3, '2026-07-16 14:00:00+00', 46000, 'Vidange - remplacement filtre', NULL, 66000, 1, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."Operations" VALUES (4, '2026-01-15 10:00:00+00', 40000, 'Contrôle courroie (en retard)', '2026-06-01 00:00:00+00', 44000, 1, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."Operations" VALUES (5, '2026-07-16 15:00:00+00', 46000, 'Vidange huile usagée', NULL, NULL, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public."Operations" VALUES (6, '2026-07-16 15:00:00+00', 46000, 'Remplacement filtre à huile', NULL, NULL, 1, 1) ON CONFLICT DO NOTHING;


--
-- Data for Name: Notes; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."Notes" VALUES (1, 'Rayure sur l''aile avant droite constatée', '2026-07-16 16:00:00+00', 46000, 1, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."Notes" VALUES (2, 'test 123', '2026-07-30 20:26:17.85+00', 46500, 1, NULL, NULL) ON CONFLICT DO NOTHING;


--
-- Data for Name: Parts; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."Parts" VALUES (1, 'Filtre à huile', 'Purflux', 'LS923', 5) ON CONFLICT DO NOTHING;
INSERT INTO public."Parts" VALUES (2, 'Filtre à huile', 'Purflux', 'LS923', 6) ON CONFLICT DO NOTHING;


--
-- Data for Name: OperationConsumables; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."OperationConsumables" VALUES (1, 3, 3, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."OperationConsumables" VALUES (2, 1, 6, 2) ON CONFLICT DO NOTHING;


--
-- Data for Name: OperationSpareParts; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."OperationSpareParts" VALUES (1, 'Joint de vidange', 2.50, 1) ON CONFLICT DO NOTHING;
INSERT INTO public."OperationSpareParts" VALUES (2, 'Joint de vidange', 2.50, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."OperationSpareParts" VALUES (3, 'Joint de vidange', 2.50, 3) ON CONFLICT DO NOTHING;
INSERT INTO public."OperationSpareParts" VALUES (4, 'Joint de carter', 3.50, 6) ON CONFLICT DO NOTHING;


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."Users" VALUES (1, 'Dupont', 'Jean', 'Technicien', 'jean.dupont@hesias.fr', 'jdupont', '$2a$11$3PiIsNlpuYVQQ3dcsPqWxOUuSn8DmsAZv14/qpP6ulxr.hibxQgOq') ON CONFLICT DO NOTHING;
INSERT INTO public."Users" VALUES (2, 'Système', 'Compte', 'Système', 'system@hesias.fr', 'system', '') ON CONFLICT DO NOTHING;
INSERT INTO public."Users" VALUES (3, 'Cuella', 'Samuel', 'Responsable magasin', 'samuel@hesias.fr', 'admin', '$2a$11$LYGUBExzniEOUscjFZ4BTOEZwGSfd45OJbP3bncMk5cfKU8e74aoG') ON CONFLICT DO NOTHING;
INSERT INTO public."Users" VALUES (6, 'Test', 'Tech', 'Technicien', 'tech@hesias.fr', 'tech', '$2a$11$drhhARgRvg8nIYEhOrlGZuatovO9Osyh46olIz4t01WKbYw2hadT.') ON CONFLICT DO NOTHING;


--
-- Data for Name: StockEntries; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."StockEntries" VALUES (1, 0, 4.20, '2026-07-15 23:49:26.716619+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockEntries" VALUES (2, 11, 5.60, '2026-07-15 23:50:46.352775+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockEntries" VALUES (3, 5, 4.00, '2026-07-22 22:12:14.296097+00', 2, 1) ON CONFLICT DO NOTHING;


--
-- Data for Name: StockMovements; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."StockMovements" VALUES (1, 0, 10, 4.20, '2026-07-15 23:49:26.737784+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (2, 0, 20, 5.60, '2026-07-15 23:50:46.353671+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (3, 1, -10, 4.20, '2026-07-15 23:52:16.004924+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (4, 1, -5, 5.60, '2026-07-15 23:52:16.005065+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (5, 1, -3, 5.60, '2026-07-16 21:12:21.451706+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (6, 1, -1, 5.60, '2026-07-16 21:39:40.715859+00', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."StockMovements" VALUES (7, 0, 5, 4.00, '2026-07-22 22:12:14.32434+00', 2, 1) ON CONFLICT DO NOTHING;


--
-- Data for Name: VehicleProperties; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."VehicleProperties" VALUES (7, 'Type moteur', 'H5H', 1) ON CONFLICT DO NOTHING;


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: hesias
--

INSERT INTO public."__EFMigrationsHistory" VALUES ('20260715225217_InitialCreate', '8.0.29') ON CONFLICT DO NOTHING;


--
-- Name: MetaOperations_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."MetaOperations_Id_seq"', 1, true);


--
-- Name: Notes_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."Notes_Id_seq"', 2, true);


--
-- Name: OperationConsumables_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."OperationConsumables_Id_seq"', 2, true);


--
-- Name: OperationSpareParts_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."OperationSpareParts_Id_seq"', 4, true);


--
-- Name: Operations_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."Operations_Id_seq"', 6, true);


--
-- Name: Parts_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."Parts_Id_seq"', 2, true);


--
-- Name: StockEntries_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."StockEntries_Id_seq"', 3, true);


--
-- Name: StockMovements_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."StockMovements_Id_seq"', 7, true);


--
-- Name: Users_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."Users_Id_seq"', 6, true);


--
-- Name: VehicleProperties_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."VehicleProperties_Id_seq"', 7, true);


--
-- Name: Vehicles_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: hesias
--

SELECT pg_catalog.setval('public."Vehicles_Id_seq"', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict f39jEqiXH433FQ8sNsXl9smMUh4bHxhhYPJvqveD54ekPzphcg2w45KlTh1Ej4a

