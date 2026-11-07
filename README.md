# Archon Portal (`archon-portal`)

Клиентская витрина enterprise-платформы docs-as-code и AI-native Source of Truth **Archon** ([teamv39/archon](https://github.com/teamv39/archon)).

---

## Архитектура и стек

Витрина реализована по паттерну **React SPA + BFF на Node.js/TypeScript**:

* **Web UI (SPA):** React 18+, Vite, TypeScript, Tailwind CSS, компонентная база `shadcn/ui`, таблицы `TanStack Table`, интерактивные диаграммы `@likec4/diagrams`.
* **BFF (Backend-for-Frontend):** Fastify, TypeScript, защита периметра (CORS, Helmet, Rate-limit, Token Handler / HttpOnly cookies), Mock API сервер с синтетическими фикстурами.
* **Инфраструктура:** Dockerfile (многоэтапная сборка SPA и BFF), локальный `docker-compose.yml`, CI в GitHub Actions.

---

## Команда разработки витрины

* **Артем ([@dusk190](https://github.com/dusk190))** — Tech Lead / Fullstack & BFF Lead
* **Кирилл ([@KiRyXaIvaNov](https://github.com/KiRyXaIvaNov))** — Frontend Lead
* **Егор ([@Bruuhher](https://github.com/Bruuhher))** — DevOps / Infra
* **Екатерина ([@katyaand007](https://github.com/katyaand007)) — UX/UI Designer
* **Денис ([@ischademadda](https://github.com/ischademadda))** — Scrum Master & System Architect

---

## Проектное управление и документация

* **Доска задач:** [GitHub Project #3: archon-portal](https://github.com/orgs/teamv39/projects/3)
* **Архитектурный Source of Truth:** [teamv39/archon](https://github.com/teamv39/archon)
* **Гайд по онбордингу:** [`docs/guides/portal-onboarding.md`](https://github.com/teamv39/archon/blob/main/docs/guides/portal-onboarding.md)
* **План обучения и задачи:** [`docs/guides/portal-learning-plan.md`](https://github.com/teamv39/archon/blob/main/docs/guides/portal-learning-plan.md)

---

## Принцип разработки: Mock-First

Команда портала разрабатывает интерфейс автономно от инженерного ядра платформы (`archon-core-service`):
1. BFF предоставляет Mock API сервер с реалистичными JSON-фикстурами каталога и паспорта сервисов.
2. Фронтенд верстается и тестируется на моках.
3. Переключение на боевой API ядра произойдет через проксирование BFF без изменения компонентов интерфейса.

---

## Git Workflow

* Ветки: `feature/<task-id>-kebab` от `main`.
* Коммиты: `ARCH-XX: Описание` (в соответствии с номерами тикетов в проектном трекере).
* Пулл-реквесты: открываются в `main`, первичное код-ревью проводит Tech Lead (@dusk190).


## Публикация Docker-образов

При мерже в ветку `dev` или при создании релизного тега (`v*.*.*`) GitHub Actions автоматически собирает и публикует Docker-образы фронтенда (SPA) и бэкенда (BFF) в GitHub Container Registry.

**Адреса опубликованных образов:**
- Frontend (SPA): `ghcr.io/teamv39/archon-portal/frontend`
- Backend (BFF): `ghcr.io/teamv39/archon-portal/bff`

**Логика тегов:**
- `dev` — актуальная сборка из ветки `dev` (обновляется при каждом пуше).
- `sha-<hash>` — привязка к конкретному коммиту.
- `1.0.0`, `1.0` (semver) — создаются автоматически при пуше тега.

**Как скачать образы локально:**
```bash
docker pull ghcr.io/teamv39/archon-portal/frontend:dev
docker pull ghcr.io/teamv39/archon-portal/bff:dev



