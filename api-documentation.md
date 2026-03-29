# Dokumentasi REST API

Dokumentasi ini dibuat berdasarkan ERD dengan tiga entitas utama:

- **User**
- **Category**
- **Article**

Base URL:

```http
/api/v1
```

## Format Response Umum

### Success

```json
{
  "message": "Success",
  "data": {}
}
```

### Error

```json
{
  "message": "Error message",
  "errors": {
    "field_name": ["This field is required."]
  }
}
```

---

## 1. Login

### Endpoint

```http
POST /api/v1/auth/login
```

### Request

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

### Success Response

```json
{
  "message": "Login success",
  "data": {
    "token": "jwt_or_access_token_here",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin",
      "full_name": "Admin User",
      "is_active": true
    }
  }
}
```

### Error Response

```json
{
  "message": "Invalid credentials",
  "errors": {
    "non_field_errors": ["Email or password is invalid."]
  }
}
```

---

## 2. Post Category

### Endpoint

```http
POST /api/v1/categories
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request

```json
{
  "name": "Technology",
  "is_active": true
}
```

### Success Response

```json
{
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Technology",
    "is_active": true
  }
}
```

### Error Response

```json
{
  "message": "Validation error",
  "errors": {
    "name": ["This field is required."]
  }
}
```

---

## 3. Get List Category

### Endpoint

```http
GET /api/v1/categories
```

### Headers

```http
Authorization: Bearer <token>
```

### Query Params Opsional

```http
?page=1
&limit=10
&search=tech
&is_active=true
```

### Success Response

```json
{
  "message": "Category list retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Technology",
        "is_active": true
      },
      {
        "id": 2,
        "name": "Business",
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

---

## 4. Patch Category

### Endpoint

```http
PATCH /api/v1/categories/{id}
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request

```json
{
  "name": "Tech News",
  "is_active": true
}
```

### Success Response

```json
{
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Tech News",
    "is_active": true
  }
}
```

### Error Response

```json
{
  "message": "Category not found"
}
```

---

## 5. Delete Category

### Endpoint

```http
DELETE /api/v1/categories/{id}
```

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "message": "Category deleted successfully"
}
```

### Error Response

```json
{
  "message": "Category not found"
}
```

> Catatan:
> Karena `Article` memiliki relasi ke `Category`, pada implementasi nyata biasanya lebih aman memakai **soft delete** atau menolak delete jika category masih digunakan article.

---

## 6. Post Article

### Endpoint

```http
POST /api/v1/articles
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request Body

Karena ada field image (`cover`, `thumbnail`), request disarankan menggunakan `multipart/form-data`.

### Form Data

```text
author=1
category=1
title=Belajar REST API
short_description=Panduan sederhana membuat REST API
content=Isi artikel lengkap di sini...
cover=<file image>
thumbnail=<file image>
meta_title=Belajar REST API Mudah
meta_tag=rest api, backend, tutorial
meta_description=Panduan sederhana belajar REST API
is_active=true
```

### Success Response

```json
{
  "message": "Article created successfully",
  "data": {
    "id": 1,
    "author": {
      "id": 1,
      "full_name": "Admin User"
    },
    "category": {
      "id": 1,
      "name": "Technology"
    },
    "title": "Belajar REST API",
    "short_description": "Panduan sederhana membuat REST API",
    "content": "Isi artikel lengkap di sini...",
    "cover": "https://example.com/media/articles/cover.jpg",
    "thumbnail": "https://example.com/media/articles/thumb.jpg",
    "meta_title": "Belajar REST API Mudah",
    "meta_tag": "rest api, backend, tutorial",
    "meta_description": "Panduan sederhana belajar REST API",
    "is_active": true,
    "created_at": "2026-03-27T21:00:00Z",
    "updated_at": "2026-03-27T21:00:00Z"
  }
}
```

### Error Response

```json
{
  "message": "Validation error",
  "errors": {
    "title": ["This field is required."],
    "content": ["This field is required."]
  }
}
```

> Catatan:
> Jika `author` ingin lebih aman, backend sebaiknya mengambil dari user login, bukan dari request body.

---

## 7. Get List Article

### Endpoint

```http
GET /api/v1/articles
```

### Headers

```http
Authorization: Bearer <token>
```

### Query Params Opsional

```http
?page=1
&limit=10
&search=rest
&category=1
&author=1
&is_active=true
```

### Success Response

```json
{
  "message": "Article list retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Belajar REST API",
        "short_description": "Panduan sederhana membuat REST API",
        "cover": "https://example.com/media/articles/cover.jpg",
        "thumbnail": "https://example.com/media/articles/thumb.jpg",
        "category": {
          "id": 1,
          "name": "Technology"
        },
        "author": {
          "id": 1,
          "full_name": "Admin User"
        },
        "is_active": true,
        "created_at": "2026-03-27T21:00:00Z",
        "updated_at": "2026-03-27T21:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

---

## 8. Get Article Detail

### Endpoint

```http
GET /api/v1/articles/{id}
```

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "message": "Article detail retrieved successfully",
  "data": {
    "id": 1,
    "author": {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin",
      "full_name": "Admin User"
    },
    "category": {
      "id": 1,
      "name": "Technology"
    },
    "title": "Belajar REST API",
    "short_description": "Panduan sederhana membuat REST API",
    "content": "Isi artikel lengkap di sini...",
    "cover": "https://example.com/media/articles/cover.jpg",
    "thumbnail": "https://example.com/media/articles/thumb.jpg",
    "meta_title": "Belajar REST API Mudah",
    "meta_tag": "rest api, backend, tutorial",
    "meta_description": "Panduan sederhana belajar REST API",
    "is_active": true,
    "created_at": "2026-03-27T21:00:00Z",
    "updated_at": "2026-03-27T21:00:00Z"
  }
}
```

### Error Response

```json
{
  "message": "Article not found"
}
```

---

## 9. Patch Article

### Endpoint

```http
PATCH /api/v1/articles/{id}
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Request Body Contoh

```text
category=2
title=Belajar REST API Updated
short_description=Deskripsi baru
content=Isi artikel yang sudah diperbarui
meta_title=Meta title baru
meta_tag=api, backend
meta_description=Meta description baru
is_active=true
cover=<file image>
thumbnail=<file image>
```

### Success Response

```json
{
  "message": "Article updated successfully",
  "data": {
    "id": 1,
    "title": "Belajar REST API Updated",
    "short_description": "Deskripsi baru",
    "content": "Isi artikel yang sudah diperbarui",
    "cover": "https://example.com/media/articles/new-cover.jpg",
    "thumbnail": "https://example.com/media/articles/new-thumb.jpg",
    "meta_title": "Meta title baru",
    "meta_tag": "api, backend",
    "meta_description": "Meta description baru",
    "is_active": true,
    "updated_at": "2026-03-27T21:30:00Z"
  }
}
```

### Error Response

```json
{
  "message": "Article not found"
}
```

---

## 10. Delete Article

### Endpoint

```http
DELETE /api/v1/articles/{id}
```

### Headers

```http
Authorization: Bearer <token>
```

### Success Response

```json
{
  "message": "Article deleted successfully"
}
```

### Error Response

```json
{
  "message": "Article not found"
}
```

---

## Ringkasan Endpoint

```http

USER FUNC LIST (COOKIES VALIDATION)

PATCH  /api/v1/categories/{id}
DELETE /api/v1/categories/{id} 

POST   /api/v1/articles (USER CREATE NEWS)
GET    /api/v1/articles (GET USER NEWS)
GET    /api/v1/articles/{id} (GET NEWS DETAIL BY ID)

PATCH  /api/v1/articles/{id} 

DELETE /api/v1/articles/{id} (DELETE NEWS BY ID)
```

---

## Validasi

### Category

- `name`: required, string, unique
- `is_active`: boolean

### Article

- `author`: required FK user
- `category`: required FK category
- `title`: required, string
- `short_description`: optional, string
- `content`: required, text
- `cover`: optional image
- `thumbnail`: optional image
- `meta_title`: optional string
- `meta_tag`: optional string
- `meta_description`: optional string
- `is_active`: boolean

### Login

- `email`: required
- `password`: required

---
