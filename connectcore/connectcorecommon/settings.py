# Copyright 2022,2023, Digi International Inc.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

"""
Django settings for Digi ConnectCore Web Application project.

Generated by 'django-admin startproject' using Django 3.1.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""
import os
from pathlib import Path

PRODUCTION_RUN = os.getenv('DJANGO_PRODUCTION_RUN', False)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent

# Build URL root dir.
SUBDIR = os.getenv('SUBDIR', None)
ROOT_DIR = "/" if not SUBDIR else "/%s/" % SUBDIR

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
if not PRODUCTION_RUN:
    SECRET_KEY = '5u2pnuu$*$^h&^aq^9sve%gwf-hc@3s3$78q4lb4an5w=v(gqy'
else:
    SECRET_KEY = os.environ['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
if not PRODUCTION_RUN:
    DEBUG = True
else:
    DEBUG = False

if not PRODUCTION_RUN:
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = os.environ['ALLOWED_HOSTS'].split(",")

if PRODUCTION_RUN and (os.environ.get('CSRF_TRUSTED_ORIGINS', None) is not None
                       and len(os.environ.get('CSRF_TRUSTED_ORIGINS', None)) > 0):
    CSRF_TRUSTED_ORIGINS = os.environ['CSRF_TRUSTED_ORIGINS'].split(",")

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'login',
    'connectcorecore',
    'channels',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'connectcorecommon.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['connectcorecommon/templates/'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
            'libraries': {
                'custom_tags': 'templatetags.custom_tags',
            }
        },
    },
]

WSGI_APPLICATION = 'connectcorecommon.wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

if not PRODUCTION_RUN:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ['DB_NAME'],
            'USER': os.environ['DB_USER'],
            'PASSWORD': os.environ['DB_PASSWORD'],
            'HOST': os.environ['DB_HOST'],
            'PORT': os.environ['DB_PORT'],
        }
    }

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '%sstatic/' % ROOT_DIR

STATIC_ROOT = os.path.join(BASE_DIR, "static/")
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static_files"),
]

LOGIN_URL = '%saccess/login/' % ROOT_DIR

SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Expire when the browser closes
SESSION_COOKIE_AGE = 10 * 60  # Expire after 10 minutes
SESSION_SAVE_EVERY_REQUEST = True  # Refresh the session on every request

# Channels
ASGI_APPLICATION = 'connectcorecommon.asgi.application'

if not PRODUCTION_RUN:
    CHANNEL_LAYERS = {
        "default": {
            ### Method 1: Via redis lab
            # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
            # 'CONFIG': {
            #     "hosts": [
            #       'redis://h:<password>;@<redis Endpoint>:<port>'
            #     ],
            # },

            ### Method 2: Via local Redis
            # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
            # 'CONFIG': {
            #      "hosts": [('127.0.0.1', 6379)],
            # },

            ### Method 3: Via In-memory channel layer
            ## WARNING!!! This is not recommended for production
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [('127.0.0.1', 6379)],
            },
        },
    }
