# StudySync

StudySync - это платформа, где студенты могут находить study buddy, создавать мини-группы по предметам и объединяться для совместной подготовки.

Начальный шаблон учебного full-stack проекта на `Angular + Django`.

## Структура проекта

- `frontend/` - клиентская часть на Angular
- `backend/` - серверная часть на Django

## Что уже подготовлено

- создан Angular-проект
- добавлена стартовая landing page для проекта
- подготовлен Django-каркас с базовым API endpoint `/api/health/`
- добавлены `requirements.txt` и `.gitignore`

## Описание проекта

Пользователи StudySync смогут:

- искать студентов по конкретным предметам
- создавать мини-группы для совместного обучения
- присоединяться к существующим study groups
- находить study buddy для подготовки к экзаменам, квизам и домашним заданиям

Основная цель платформы - упростить поиск единомышленников для учебы и сделать совместную подготовку более удобной.

## Команда

Заполните перед сдачей:

- Davletov Akylbek
- Ongarova Nurila
- Toleubek Alan

## Как запустить frontend

```bash
cd frontend
npm install
npm start
```

Frontend будет доступен на `http://localhost:4200`.

## Как запустить backend

Рекомендуемый вариант через виртуальное окружение:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

Backend будет доступен на `http://127.0.0.1:8000`.

Проверка API:

```bash
http://127.0.0.1:8000/api/health/
```

## Ближайшие шаги

1. Уточнить тему проекта и пользовательские роли.
2. Добавить страницы Angular и реальные API endpoint'ы.
3. Подключить базу данных и модели.
4. Реализовать авторизацию, группы и взаимодействие с API.
