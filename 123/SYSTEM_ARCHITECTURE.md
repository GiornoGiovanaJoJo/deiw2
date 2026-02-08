# EP-System - Полная Документация Архитектуры и Функционала

## Оглавление
1. [Обзор системы](#обзор-системы)
2. [Структура базы данных](#структура-базы-данных)
3. [Роли и права доступа](#роли-и-права-доступа)
4. [Архитектура приложения](#архитектура-приложения)
5. [Функциональность страниц](#функциональность-страниц)
6. [Компоненты](#компоненты)
7. [Backend функции](#backend-функции)
8. [UI/UX Дизайн](#uiux-дизайн)

---

## Обзор системы

**EP-System** - это комплексная система управления строительными проектами для австрийской компании. Система включает:
- Управление проектами и задачами
- Систему заявок от клиентов
- Управление складом и товарами
- Интеграцию с кассами (Kassas)
- Учет рабочего времени (Zeiterfassung)
- Управление пользователями, клиентами и субподрядчиками
- Систему документов и этапов проектов
- Комментарии и обсуждения
- Систему приемки работ (Abnahme)

**Технологии:**
- Frontend: React 18, Tailwind CSS, shadcn/ui компоненты
- Backend: Base44 BaaS (Backend as a Service)
- База данных: Base44 Entities (NoSQL)
- Роутинг: React Router DOM
- State Management: React Query + Local State
- UI: Lucide Icons, Framer Motion, Recharts

---

## Структура базы данных

### 1. Projekt (Проекты)
```json
{
  "projekt_nummer": "string (EP-XXXX)",
  "name": "string",
  "beschreibung": "string",
  "kunde_id": "string",
  "anfrage_id": "string",
  "projektleiter_id": "string",
  "gruppenleiter_ids": ["string"],
  "worker_ids": ["string"],
  "subunternehmer_ids": ["string"],
  "kategorie": "string",
  "unterkategorie": "string",
  "zusatzfelder": "object",
  "status": "Geplant | In Bearbeitung | Abgeschlossen | Pausiert | Storniert",
  "startdatum": "date",
  "enddatum": "date",
  "budget": "number",
  "foto": "string (URL)",
  "fotos": ["string (URLs)"],
  "adresse": "string",
  "prioritaet": "Niedrig | Mittel | Hoch | Kritisch",
  "abnahme_auswahl": {
    "etappen_ids": ["string"],
    "fotos_urls": ["string"],
    "dokumente_ids": ["string"]
  }
}
```

### 2. Benutzer (Пользователи)
```json
{
  "vorname": "string",
  "nachname": "string",
  "email": "string",
  "position": "Admin | Projektleiter | Gruppenleiter | Worker | Warehouse | Büro",
  "spezialisierung": "string",
  "vorgesetzter_id": "string",
  "telefon": "string",
  "qr_code": "string",
  "passwort": "string",
  "status": "Aktiv | Inaktiv",
  "foto": "string (URL)"
}
```

### 3. Kunde (Клиенты)
```json
{
  "typ": "Firma | Privat",
  "firma": "string",
  "ansprechpartner": "string",
  "email": "string",
  "telefon": "string",
  "adresse": "string",
  "plz": "string",
  "stadt": "string",
  "notizen": "string",
  "status": "Aktiv | Inaktiv"
}
```

### 4. Anfrage (Заявки)
```json
{
  "kategorie": "string",
  "unterkategorie": "string",
  "kunde_name": "string",
  "kunde_email": "string",
  "kunde_telefon": "string",
  "kunde_adresse": "string",
  "antworten": "object",
  "status": "Neu | In Bearbeitung | Angeboten | Abgeschlossen | Abgelehnt",
  "notizen": "string",
  "projekt_id": "string"
}
```

### 5. Etappe (Этапы проекта)
```json
{
  "projekt_id": "string",
  "name": "string",
  "beschreibung": "string",
  "bilder": ["string (URLs)"],
  "status": "Geplant | In Bearbeitung | Abgeschlossen",
  "reihenfolge": "number"
}
```

### 6. Dokument (Документы)
```json
{
  "projekt_id": "string",
  "titel": "string",
  "beschreibung": "string",
  "typ": "Plan | Vertrag | Bericht | Rechnung | Sonstiges",
  "datei_url": "string",
  "datei_name": "string",
  "datei_groesse": "number",
  "tags": ["string"],
  "status": "Aktiv | Archiviert"
}
```

### 7. Aufgabe (Задачи)
```json
{
  "titel": "string",
  "beschreibung": "string",
  "zugewiesen_an": "string",
  "zugewiesen_name": "string",
  "projekt_id": "string",
  "projekt_nummer": "string",
  "prioritaet": "Niedrig | Mittel | Hoch | Kritisch",
  "status": "Offen | In Bearbeitung | Erledigt | Storniert",
  "faellig_am": "date"
}
```

### 8. Kommentar (Комментарии)
```json
{
  "entitaet_typ": "Projekt | Etappe | Aufgabe | Dokument",
  "entitaet_id": "string",
  "inhalt": "string",
  "benutzer_name": "string",
  "benutzer_id": "string",
  "parent_kommentar_id": "string",
  "mentions": [
    {"benutzer_id": "string", "benutzer_name": "string"}
  ]
}
```

### 9. Notiz (Заметки)
```json
{
  "titel": "string",
  "inhalt": "string",
  "datum": "date",
  "dateien": [
    {"url": "string", "name": "string"}
  ],
  "benutzer_id": "string",
  "benutzer_name": "string",
  "farbe": "blau | grün | gelb | rot | lila",
  "wichtig": "boolean"
}
```

### 10. Kategorie (Категории)
```json
{
  "name": "string",
  "beschreibung": "string",
  "parent_id": "string",
  "typ": "Projekt | Ware",
  "farbe": "string",
  "icon_name": "string (lucide-react)",
  "bild": "string (URL)",
  "zusatzfelder": [
    {
      "name": "string",
      "label": "string",
      "type": "text | number | select | textarea | radio",
      "options": ["string"],
      "erforderlich": "boolean"
    }
  ]
}
```

### 11. Ware (Товары)
```json
{
  "name": "string",
  "beschreibung": "string",
  "barcode": "string",
  "kategorie_id": "string",
  "einheit": "Stk | kg | m | l | m² | m³ | Set",
  "einkaufspreis": "number",
  "verkaufspreis": "number",
  "bestand": "number",
  "mindestbestand": "number",
  "lagerort": "string",
  "notizen": "string",
  "bild": "string (URL)",
  "status": "Verfügbar | Niedrig | Ausverkauft"
}
```

### 12. WarenLog (Лог движения товаров)
```json
{
  "ware_id": "string",
  "ware_name": "string",
  "benutzer_id": "string",
  "benutzer_name": "string",
  "projekt_id": "string",
  "projekt_nummer": "string",
  "aktion": "Entnahme | Rückgabe | Eingang | Korrektur | Inventur | Verkauf",
  "menge": "number",
  "notiz": "string",
  "datum": "date-time"
}
```

### 13. Zeiterfassung (Учет времени)
```json
{
  "benutzer_id": "string",
  "benutzer_name": "string",
  "datum": "date",
  "eingang_zeit": "string (HH:MM)",
  "ausgang_zeit": "string (HH:MM)",
  "stunden": "number",
  "projekt_id": "string",
  "projekt_nummer": "string",
  "ort": "Büro | Projekt",
  "notiz": "string"
}
```

### 14. Kassa (Кассы)
```json
{
  "name": "string",
  "kassa_nummer": "string",
  "api_key": "string",
  "status": "Подключена | Не подключена | Ошибка",
  "последняя_синхронизация": "date-time",
  "описание": "string",
  "адрес": "string"
}
```

### 15. KassaSale (Продажи с касс)
```json
{
  "kassa_id": "string",
  "kassa_name": "string",
  "ware_id": "string",
  "ware_name": "string",
  "количество": "number",
  "сумма": "number",
  "дата": "date-time",
  "статус": "Обработана | Ожидание | Ошибка",
  "уменьшено_количество": "boolean",
  "нужна_закупка": "boolean"
}
```

### 16. Subunternehmer (Субподрядчики)
```json
{
  "firma": "string",
  "ansprechpartner": "string",
  "email": "string",
  "telefon": "string",
  "adresse": "string",
  "plz": "string",
  "stadt": "string",
  "spezialisierung": "string",
  "status": "Aktiv | Inaktiv",
  "notizen": "string",
  "stundensatz": "number"
}
```

### 17. Ticket (Тикеты поддержки)
```json
{
  "betreff": "string",
  "nachricht": "string",
  "absender_name": "string",
  "absender_email": "string",
  "absender_telefon": "string",
  "kategorie": "Anfrage | Support | Beschwerde | Sonstiges",
  "status": "Neu | In Bearbeitung | Beantwortet | Geschlossen",
  "prioritaet": "Niedrig | Mittel | Hoch",
  "bearbeiter_id": "string",
  "antwort": "string"
}
```

---

## Роли и права доступа

### Иерархия ролей:
1. **Admin** - полный доступ ко всем функциям
2. **Projektleiter** (Руководитель проектов) - управление проектами, пользователями
3. **Gruppenleiter** (Групповой лидер) - доступ к своим проектам
4. **Worker** (Рабочий) - базовый доступ
5. **Büro** (Офис) - административный доступ без полевых функций
6. **Warehouse** (Склад) - доступ к складским операциям

### Матрица доступа:

| Страница | Admin | Projektleiter | Gruppenleiter | Worker | Büro | Warehouse |
|----------|-------|---------------|---------------|--------|------|-----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notizen | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Aufgaben | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Zeiterfassung | ✓ | ✓ | ✓ | - | ✓ | - |
| ZeitTerminal | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Benutzer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subunternehmer | ✓ | ✓ | - | - | - | - |
| Kunden | ✓ | ✓ | - | - | ✓ | - |
| Projekte | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Kategorien | ✓ | ✓ | - | - | ✓ | ✓ |
| Anfragen | ✓ | - | - | - | ✓ | - |
| Support | ✓ | - | - | - | ✓ | - |
| LagerDashboard | ✓ | - | - | - | ✓ | ✓ |
| Waren | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Terminal | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| LagerKassa | ✓ | - | - | - | - | ✓ |
| Protokoll | ✓ | - | - | - | ✓ | ✓ |
| LagerBenutzer | ✓ | - | - | - | ✓ | ✓ |

### Фильтрация данных по ролям:
- **Projektleiter**: видит проекты, где он назначен руководителем
- **Gruppenleiter**: видит проекты, где он назначен групповым лидером
- **Worker**: видит проекты, где он назначен рабочим

---

## Архитектура приложения

### Структура файлов:
```
/entities/           # JSON схемы базы данных
/pages/             # Страницы приложения (React компоненты)
/components/        # Переиспользуемые компоненты
  /ui/             # shadcn/ui компоненты
  /DashboardWidgets/ # Виджеты дашборда
/functions/         # Backend функции (Deno)
/Layout.js          # Главный layout с навигацией
```

### Навигация (Layout.js):

**Основная структура:**
- Боковая панель (Sidebar) с разделами:
  - **Allgemein** (Общее)
  - **Lagerverwaltung** (Управление складом)
  - **Zeiterfassung** (Учет времени)
- Верхняя панель (Header) с путем навигации
- Профиль пользователя с быстрым переключением (для тестирования)
- Кнопка выхода

**Мобильная адаптация:**
- Скрытая боковая панель с оверлеем
- Кнопка меню в хедере
- Нижний отступ для контента

**Состояние:**
- `sidebarOpen`: состояние боковой панели
- `mobileOpen`: состояние мобильного меню
- `expandedSections`: раскрытые секции меню

---

## Функциональность страниц

### 1. Dashboard (Главная панель)
**Путь:** `/Dashboard`

**Функционал:**
- Статистика: общее количество проектов, активных проектов, пользователей
- Виджеты (настраиваемые):
  - Статус проектов (диаграмма)
  - Предстоящие дедлайны
  - Последняя активность
  - Обзор бюджета
- Список активных проектов
- Задачи на сегодня
- Документы по проектам

**Состояние:**
- Загрузка данных проектов, пользователей, задач, документов
- Локальное хранение настроек виджетов

**UI компоненты:**
- StatCard - карточки статистики
- ProjectStatusSummary - виджет статуса проектов
- UpcomingDeadlines - виджет дедлайнов
- RecentActivity - виджет активности
- BudgetOverview - виджет бюджета
- DashboardCustomizer - настройка виджетов

---

### 2. Benutzer (Пользователи)
**Путь:** `/Benutzer`

**Функционал:**
- Таблица пользователей с фильтрацией и поиском
- Добавление/редактирование пользователей
- Удаление пользователей (только Admin)
- Просмотр детальной информации
- Генерация QR-кодов для терминалов
- Назначение ролей и позиций

**CRUD операции:**
- Create: создание нового пользователя
- Read: список и детали пользователей
- Update: редактирование данных
- Delete: удаление (с подтверждением)

**Поля формы:**
- Vorname, Nachname
- Email, Telefon
- Position (роль)
- Spezialisierung
- Status (Aktiv/Inaktiv)
- Foto (загрузка изображения)

---

### 3. Projekte (Проекты)
**Путь:** `/Projekte`

**Функционал:**
- Карточки проектов с информацией
- Фильтрация по статусу
- Поиск по названию/номеру
- Создание нового проекта
- Редактирование проекта
- Удаление проекта (права доступа)
- Переход к деталям проекта

**Отображение:**
- Номер проекта (EP-XXXX)
- Название и описание
- Клиент
- Статус и приоритет (цветные бейджи)
- Даты начала/окончания
- Фото проекта

**Фильтрация по ролям:**
- Projektleiter: свои проекты
- Gruppenleiter: где назначен
- Worker: где назначен

---

### 4. ProjektDetail (Детали проекта)
**Путь:** `/ProjektDetail?id=xxx`

**Вкладки:**
1. **Übersicht** (Обзор)
   - Основная информация
   - Статус, приоритет
   - Команда (руководитель, лидеры, рабочие, субподрядчики)
   - Категория
   - Бюджет
   - Адрес
   - Фотогалерея

2. **Etappen** (Этапы)
   - Список этапов проекта
   - Добавление/редактирование этапов
   - Загрузка фото этапов
   - Изменение статуса этапов
   - Drag & drop для сортировки

3. **Material** (Материалы)
   - История использования материалов из склада
   - Кто, когда, что взял
   - Проект и количество

4. **Arbeitszeit** (Рабочее время)
   - Общее количество часов по проекту
   - Детализация по датам и пользователям

5. **Dokumente** (Документы)
   - Загрузка документов
   - Типы: Plan, Vertrag, Bericht, Rechnung
   - Теги для категоризации
   - Комментарии к документам

6. **Diskussion** (Обсуждение)
   - Комментарии и обсуждения
   - Упоминания пользователей (@mention)
   - Ответы на комментарии (threading)

7. **Abnahme** (Приемка)
   - Выбор этапов для показа клиенту (галочки)
   - Выбор фото для показа клиенту
   - Выбор документов для показа клиенту
   - Сохранение выбора в проекте

8. **Bericht** (Отчет)
   - Генерация PDF отчета по проекту
   - Статус проекта
   - Прогресс выполнения этапов
   - Использованные материалы
   - Отработанное время
   - Документы

**Компоненты:**
- EtappenManager - управление этапами
- DokumentManager - управление документами
- CommentThread - система комментариев
- ProjectReport - генерация отчета
- AbnahmeManager - управление приемкой

---

### 5. ProjektNeu (Создание проекта)
**Путь:** `/ProjektNeu`

**Форма создания:**
- Автогенерация номера проекта (EP-XXXX)
- Название и описание
- Выбор клиента (или создание нового)
- Назначение руководителя
- Автоподбор групповых лидеров и рабочих
- Категория и подкатегория
- Динамические дополнительные поля
- Статус и приоритет
- Даты начала/окончания
- Бюджет
- Адрес
- Загрузка фотографий

**Логика:**
- При выборе Projektleiter автоматически подтягиваются его подчиненные
- При смене категории обновляются подкатегории и доп. поля
- Сохранение создает проект и перенаправляет на детали

---

### 6. ProjektBearbeiten (Редактирование проекта)
**Путь:** `/ProjektBearbeiten?id=xxx`

**Аналогично ProjektNeu, но:**
- Загружает существующие данные
- Обновляет проект вместо создания
- Кнопка "Abbrechen" возвращает к деталям

---

### 7. Anfragen (Заявки)
**Путь:** `/Anfragen`

**Функционал:**
- Таблица заявок от клиентов
- Фильтрация по статусу
- Поиск по имени/email
- Просмотр деталей заявки
- Изменение статуса и заметок
- Создание проекта из заявки

**Детали заявки:**
- Информация о клиенте
- Категория и подкатегория
- Ответы на вопросы
- Внутренние заметки
- Связанный проект (если создан)

**Статусы:**
- Neu, In Bearbeitung, Angeboten, Abgeschlossen, Abgelehnt

---

### 8. AnfrageForm (Форма заявки - публичная)
**Путь:** `/AnfrageForm`

**Публичная форма для клиентов:**
- Выбор категории услуг
- Выбор подкатегории
- Динамические вопросы по категории
- Контактные данные (имя, email, телефон, адрес)
- Отправка заявки создает запись в Anfrage

**Компонент:**
- CategorySelector - выбор категории с иконками

---

### 9. Kategorien (Категории)
**Путь:** `/Kategorien`

**Функционал:**
- Управление категориями для проектов и товаров
- Создание категорий и подкатегорий
- Настройка иконок и цветов
- Добавление дополнительных полей (динамические формы)
- Типы полей: text, number, select, textarea, radio

**Структура:**
- Главные категории
- Подкатегории (parent_id)
- Дополнительные поля для каждой подкатегории

---

### 10. Kunden (Клиенты)
**Путь:** `/Kunden`

**Функционал:**
- Список клиентов (фирмы и частные лица)
- Добавление/редактирование клиентов
- Удаление клиентов
- Поиск и фильтрация
- Просмотр проектов клиента

**Поля:**
- Тип (Firma/Privat)
- Название/Имя
- Контактное лицо
- Email, телефон
- Адрес (адрес, PLZ, город)
- Заметки
- Статус

---

### 11. Subunternehmer (Субподрядчики)
**Путь:** `/Subunternehmer`

**Функционал:**
- Список субподрядчиков
- Добавление/редактирование
- Удаление
- Специализация (Elektriker, Schlosser и т.д.)
- Почасовая ставка

**Поля:**
- Фирма
- Контактное лицо
- Email, телефон
- Адрес
- Специализация
- Почасовая ставка
- Заметки
- Статус

---

### 12. Aufgaben (Задачи)
**Путь:** `/Aufgaben`

**Функционал:**
- Канбан-доска задач (Offen, In Bearbeitung, Erledigt)
- Создание задач
- Назначение пользователям
- Привязка к проектам
- Приоритеты и сроки
- Drag & drop между колонками

**Поля задачи:**
- Название, описание
- Назначен на (пользователь)
- Проект
- Приоритет
- Статус
- Срок выполнения

---

### 13. Notizen (Заметки)
**Путь:** `/Notizen`

**Функционал:**
- Личные заметки пользователей
- Цветовая кодировка
- Отметка "важно"
- Прикрепление файлов
- Создание/редактирование/удаление

**Поля:**
- Заголовок
- Содержимое
- Цвет (blau, grün, gelb, rot, lila)
- Важно (булевый)
- Файлы
- Дата

---

### 14. Support (Поддержка)
**Путь:** `/Support`

**Функционал:**
- Просмотр тикетов поддержки
- Изменение статуса и приоритета
- Назначение обработчика
- Ответ на тикет

**Статусы:**
- Neu, In Bearbeitung, Beantwortet, Geschlossen

---

### 15. SupportForm (Форма поддержки - публичная)
**Путь:** `/SupportForm`

**Публичная форма:**
- Тема, сообщение
- Контакты (имя, email, телефон)
- Категория
- Отправка создает тикет

---

### 16. Waren (Товары)
**Путь:** `/Waren`

**Функционал:**
- Каталог товаров
- Добавление/редактирование товаров
- Штрихкоды (EAN)
- Цены (закупка/продажа)
- Остатки на складе
- Минимальный остаток (уведомления)
- Категории товаров

**Поля:**
- Название, описание
- Штрихкод
- Категория
- Единица измерения
- Цены
- Текущий остаток
- Минимальный остаток
- Место хранения
- Фото

---

### 17. Terminal (Терминал склада)
**Путь:** `/Terminal`

**Функционал:**
- Вход по QR-коду
- Сканирование штрихкодов
- Взятие/возврат товаров
- Привязка к проекту
- История операций

**Режимы:**
1. Экран входа (QR-сканер)
2. Рабочий экран:
   - Поиск/сканирование товара
   - Выбор действия (взять/вернуть)
   - Указание количества
   - Выбор проекта
   - Подтверждение

**Логика:**
- Создает записи в WarenLog
- Обновляет остатки в Ware
- Проверяет минимальный остаток

---

### 18. Protokoll (Протокол склада)
**Путь:** `/Protokoll`

**Функционал:**
- История всех движений товаров
- Фильтрация по:
  - Пользователю
  - Товару
  - Проекту
  - Дате
  - Типу операции
- Экспорт в CSV/Excel

**Отображение:**
- Дата и время
- Пользователь
- Товар
- Действие
- Количество
- Проект
- Заметки

---

### 19. LagerKassa (Кассы)
**Путь:** `/LagerKassa`

**Функционал:**
- Управление подключениями касс
- Добавление новой кассы
- API ключи
- Статус подключения
- Последняя синхронизация
- Просмотр продаж

**Backend интеграция:**
- Webhook для получения данных о продажах
- Автоматическое уменьшение остатков
- Уведомления о низких остатках

---

### 20. LagerDashboard (Панель склада)
**Путь:** `/LagerDashboard`

**Функционал:**
- Общая статистика склада
- Остатки товаров
- Предупреждения о низких остатках
- График движения товаров
- Последние операции
- Продажи с касс

---

### 21. LagerBenutzer (Пользователи склада)
**Путь:** `/LagerBenutzer`

**Функционал:**
- Список пользователей с доступом к складу
- Статистика работы
- История операций пользователя

---

### 22. Zeiterfassung (Учет времени)
**Путь:** `/Zeiterfassung`

**Функционал:**
- Журнал учета рабочего времени
- Фильтрация по:
  - Пользователю
  - Датам
  - Проекту
- Редактирование записей
- Экспорт в CSV

**Отображение:**
- Дата
- Пользователь
- Время входа/выхода
- Отработанные часы
- Место (Büro/Projekt)
- Проект
- Заметки

**Суммарная статистика:**
- Всего записей
- Всего часов
- Присутствующие сегодня

---

### 23. ZeitTerminal (Терминал времени)
**Путь:** `/ZeitTerminal`

**Функционал:**
- Вход по QR-коду
- Отметка прихода (Eingang)
- Отметка ухода (Ausgang)
- Выбор места работы (Офис/Проект)
- Поиск и выбор проекта
- История за день
- Автоматический расчет часов

**Режимы:**
1. Экран входа (QR-сканер)
2. Рабочий экран:
   - Текущее время
   - Имя пользователя
   - Кнопки Eingang/Ausgang
   - Выбор места работы
   - Поиск проекта
   - История сегодня

**Логика:**
- Создает записи в Zeiterfassung
- Рассчитывает часы при выходе
- Валидация (нельзя выйти без входа)

---

### 24. BenutzerLogin (Вход пользователя)
**Путь:** `/BenutzerLogin`

**Функционал:**
- Вход в систему
- Хранение сессии (localStorage)
- Автоматическая аутентификация Base44
- Срок сессии: 24 часа

---

## Компоненты

### UI Компоненты (shadcn/ui)
- Button
- Input
- Select
- Textarea
- Card
- Dialog
- Tabs
- Table
- Badge
- Checkbox
- Calendar
- Popover
- Dropdown Menu
- Toast/Sonner

### Пользовательские компоненты

#### 1. EtappenManager
**Назначение:** Управление этапами проекта

**Функционал:**
- Список этапов с сортировкой
- Добавление нового этапа
- Редактирование этапа
- Загрузка фото этапа (CameraPhotoUpload)
- Изменение статуса
- Drag & drop для изменения порядка

#### 2. DokumentManager
**Назначение:** Управление документами проекта

**Функционал:**
- Список документов
- Загрузка новых документов
- Типы документов
- Теги
- Комментарии к документам

#### 3. CommentThread
**Назначение:** Система комментариев

**Функционал:**
- Отображение комментариев
- Добавление нового комментария
- Ответы на комментарии (threading)
- Упоминания пользователей (@)
- Markdown поддержка

#### 4. CommentForm
**Назначение:** Форма добавления комментария

**Функционал:**
- Текстовое поле с автоувеличением
- Автодополнение @mentions
- Отправка комментария

#### 5. AbnahmeManager
**Назначение:** Управление приемкой работ

**Функционал:**
- Выбор этапов для показа клиенту (галочки)
- Выбор фото для показа клиенту
- Выбор документов для показа клиенту
- Кнопки "Выбрать все" / "Снять все"
- Сохранение выбора в поле `abnahme_auswahl` проекта
- Визуальная статистика выбранных элементов

**UI:**
- Карточки суммарной информации (этапы/фото/документы)
- Чекбоксы для выбора
- Сетка для отображения фото
- Список этапов и документов

#### 6. ProjectReport
**Назначение:** Генерация отчета по проекту

**Функционал:**
- Сбор данных проекта
- Отображение статистики
- Кнопка генерации PDF
- Backend вызов для создания PDF

#### 7. CategorySelector
**Назначение:** Выбор категории с визуализацией

**Функционал:**
- Отображение категорий с иконками
- Выбор подкатегории
- Динамическая форма доп. полей

#### 8. CameraPhotoUpload
**Назначение:** Загрузка фото с камеры или галереи

**Функционал:**
- Открытие камеры
- Выбор из галереи
- Предпросмотр
- Загрузка на сервер

#### 9. CreateProjectMinimal
**Назначение:** Быстрое создание проекта из заявки

**Функционал:**
- Минимальная форма создания проекта
- Выбор или создание клиента
- Автозаполнение данных из заявки

#### 10. ProjektNeuDialog
**Назначение:** Диалог создания проекта

**Функционал:**
- Полная форма создания
- Все поля проекта

#### 11. PWAInstallPrompt
**Назначение:** Подсказка установки PWA

**Функционал:**
- Определение возможности установки
- Показ баннера установки
- Обработка установки

#### 12. UserNotRegisteredError
**Назначение:** Ошибка незарегистрированного пользователя

#### 13. DashboardWidgets
- **ProjectStatusSummary**: диаграмма статусов проектов
- **UpcomingDeadlines**: предстоящие дедлайны
- **RecentActivity**: последняя активность
- **BudgetOverview**: обзор бюджетов
- **DashboardCustomizer**: настройка виджетов

---

## Backend функции

### 1. generateProjectReport
**Путь:** `/functions/generateProjectReport.js`

**Назначение:** Генерация PDF отчета по проекту

**Входные данные:**
```javascript
{
  projekt_id: "string"
}
```

**Процесс:**
1. Загрузка данных проекта
2. Загрузка этапов, документов, материалов, времени
3. Форматирование данных
4. Создание PDF (jsPDF)
5. Возврат PDF как arraybuffer

**Выходные данные:**
- Binary PDF file

---

### 2. kassaWebhook
**Путь:** `/functions/kassaWebhook.js`

**Назначение:** Обработка продаж с касс

**Входные данные (webhook):**
```javascript
{
  kassa_nummer: "string",
  barcode: "string",
  количество: "number",
  сумма: "number",
  дата: "date-time"
}
```

**Процесс:**
1. Валидация webhook
2. Поиск кассы по номеру
3. Поиск товара по штрихкоду
4. Создание записи KassaSale
5. Уменьшение остатка товара
6. Создание записи WarenLog
7. Проверка минимального остатка
8. Обновление статуса товара

**Выходные данные:**
```javascript
{
  status: "success",
  message: "Sale processed"
}
```

---

## UI/UX Дизайн

### Цветовая схема

**Основные цвета:**
- Primary: #1e40af (синий)
- Primary Light: #3b82f6
- Accent: #0ea5e9

**Цвета статусов проектов:**
- Geplant: серый (#6b7280)
- In Bearbeitung: синий (#3b82f6)
- Abgeschlossen: зеленый (#10b981)
- Pausiert: желтый (#f59e0b)
- Storniert: красный (#ef4444)

**Цвета приоритетов:**
- Niedrig: зеленый (#10b981)
- Mittel: желтый (#f59e0b)
- Hoch: оранжевый (#f97316)
- Kritisch: красный (#ef4444)

### Шрифты
- Семейство: система по умолчанию (sans-serif)
- Заголовки: font-semibold, font-bold
- Текст: font-normal

### Отступы и размеры
- Контейнеры: max-w-7xl, max-w-5xl
- Padding: p-3 (mobile), p-4 (tablet), p-6 (desktop)
- Карточки: rounded-xl, shadow-sm
- Кнопки: h-9, h-10, rounded-md

### Анимации
- Transitions: transition-all duration-200/300
- Hover эффекты: hover:bg-slate-50
- Framer Motion для:
  - Модальные окна
  - Drag & drop
  - Анимация появления

### Иконки
- Библиотека: Lucide React
- Размеры: w-4 h-4 (маленькие), w-5 h-5 (средние), w-6 h-6 (большие)
- Цвета: text-slate-400, text-blue-600 и т.д.

### Адаптивность

**Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

**Мобильная версия:**
- Скрытая боковая панель
- Стековая компоновка
- Увеличенные кнопки и поля ввода
- Оптимизированные таблицы

**Планшет:**
- Частично видимая боковая панель
- Сетки 2 колонки

**Десктоп:**
- Полная боковая панель
- Сетки 3-4 колонки
- Больше информации на экране

---

## Ключевые паттерны и Best Practices

### 1. Управление состоянием
```javascript
// Local state для UI
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

// React Query для серверных данных
const { data, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: () => base44.entities.Projekt.list()
});
```

### 2. CRUD операции
```javascript
// Create
await base44.entities.Projekt.create(data);

// Read (list)
const projects = await base44.entities.Projekt.list();

// Read (filter)
const projects = await base44.entities.Projekt.filter({ status: 'Aktiv' });

// Update
await base44.entities.Projekt.update(id, data);

// Delete
await base44.entities.Projekt.delete(id);
```

### 3. Навигация
```javascript
import { createPageUrl } from "./utils";
import { Link, useNavigate } from "react-router-dom";

// Link
<Link to={createPageUrl("Dashboard")}>Dashboard</Link>

// Navigate programmatically
const navigate = useNavigate();
navigate(createPageUrl("Projekte"));

// With params
navigate(createPageUrl("ProjektDetail") + "?id=" + projektId);
```

### 4. Загрузка файлов
```javascript
const { file_url } = await base44.integrations.Core.UploadFile({ file });
```

### 5. Уведомления
```javascript
import { toast } from "sonner";

toast.success("Erfolgreich gespeichert");
toast.error("Fehler beim Speichern");
```

### 6. Аутентификация пользователя
```javascript
// Get current user
const user = await base44.auth.me();

// Logout
base44.auth.logout();

// Session storage (для терминалов)
localStorage.setItem("benutzer_session", JSON.stringify({
  id: benutzer.id,
  timestamp: Date.now()
}));
```

### 7. Фильтрация по ролям
```javascript
const canAccessPage = (pagePath) => {
  if (!benutzer) return false;
  const position = benutzer.position;
  const accessMap = { ... };
  return accessMap[position]?.includes(pagePath);
};

// Фильтрация проектов
const filteredProjects = projects.filter(projekt => {
  if (position === "Projektleiter") {
    return projekt.projektleiter_id === benutzer.id;
  }
  // ...
});
```

---

## Дополнительные заметки

### PWA Support
- Service Worker для оффлайн работы
- Manifest для установки
- Компонент PWAInstallPrompt

### Локализация
- Все тексты на немецком
- Форматы дат: DD.MM.YYYY
- Валюта: EUR (€)

### Безопасность
- Проверка ролей на фронтенде
- Backend валидация через Base44
- QR-коды для безопасного входа

### Производительность
- React Query для кэширования
- Lazy loading компонентов
- Оптимизация изображений

---

## Начало разработки с нуля

### Шаг 1: Настройка проекта
```bash
# Create React app with Vite
npm create vite@latest ep-system -- --template react

# Install dependencies
npm install @base44/sdk react-router-dom @tanstack/react-query
npm install tailwindcss @tailwindcss/forms
npm install lucide-react framer-motion recharts
npm install date-fns lodash moment
npm install @radix-ui/react-* (все компоненты)
npm install sonner # для уведомлений
```

### Шаг 2: Создание entities
Создать JSON файлы в папке `/entities/` для каждой сущности

### Шаг 3: Создание Layout
Создать `Layout.js` с навигацией и авторизацией

### Шаг 4: Создание страниц
Создать страницы в `/pages/` по порядку приоритета:
1. Dashboard
2. Benutzer
3. Projekte
4. ProjektDetail
5. И так далее

### Шаг 5: Создание компонентов
Создать компоненты в `/components/` по мере необходимости

### Шаг 6: Создание UI компонентов
Использовать shadcn/ui CLI для генерации компонентов:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
# и т.д.
```

### Шаг 7: Backend функции
Создать функции в `/functions/` для специальной логики

### Шаг 8: Тестирование
- Тестировать каждую роль
- Проверить мобильную версию
- Проверить все CRUD операции

---

**Эта документация содержит полное описание системы для воссоздания с нуля. Все функции, компоненты, страницы и логика подробно описаны.**