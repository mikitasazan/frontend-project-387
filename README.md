### Hexlet tests and linter status:
[![Actions Status](https://github.com/mikitasazan/frontend-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/mikitasazan/frontend-project-387/actions)

# Календарь звонков

Это продолжение проекта «Календарь звонков». Базовое приложение перенесено из
предыдущего репозитория и запускается в Docker.

## Стек

TypeScript, Node.js (встроенный `http`, без фреймворка), статика на `public/`.

## Установка и запуск

```bash
npm install
npm run build
npm start
```

Приложение открывается на `http://localhost:3000`.

Для разработки — `npm run dev` (через `tsx`, без сборки). Тесты — `npm test`
(`node --test`).

Через Docker:

```bash
docker build -t calendar-calls .
docker run -p 3000:3000 calendar-calls
```

## План развития

### Новые возможности

- добавить повторяющиеся события и часовые пояса;
- добавить фильтры по участникам и статусам встреч;
- добавить уведомления о предстоящих звонках;
- добавить экспорт календаря в формат iCalendar.

### Исправления

- проверить обработку пересекающихся бронирований;
- добавить понятные сообщения для неверных дат и недоступных слотов;
- проверить запуск приложения и работу основных сценариев в Docker.
