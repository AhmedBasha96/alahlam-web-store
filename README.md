# 🌐 متجر الأحلام للتوكيلات التجارية - نسخة الويب (AlAhlam Web Store)

نسخة الويب المستقلة بالكامل لمتجر الأحلام للتوكيلات التجارية، مجهزة للعمل المباشر على خوادم VPS وشاشات أجهزة الكمبيوتر والمكتبي بدقة عالية وتصميم فائق السرعة.

---

## 🚀 التشغيل السريع على خادم VPS (Quick Start on VPS)

### 1. المتطلبات الأساسية
- خادم لينكس (Ubuntu 20.04 / 22.04 أو Debian)
- مثبت عليه **Node.js 18+** و **PM2**

```bash
# تحديث السيرفر وتثبيت Node.js و PM2 (في حال لم تكن مثبتة)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

---

### 2. سحب الكود وتشغيل السيرفر
```bash
# 1. استنساخ المستودع على السيرفر
git clone https://github.com/AhmedBasha96/alahlam-web-store.git
cd alahlam-web-store

# 2. التشغيل المباشر بواسطة PM2
PORT=4000 BACKEND_URL=http://localhost:5050 pm2 start server.cjs --name "alahlam-web"

# 3. حفظ حالة PM2 لإعادة التشغيل تلقائياً عند إعادة إقلاع السيرفر
pm2 save
pm2 startup
```

---

## ⚙️ المتغيرات البيئية (Environment Variables)

يمكن تمريرها قبل أمر التشغيل أو في ملف بيئة:
| المتغير | الوصف | القيمة الافتراضية |
|---|---|---|
| `PORT` | المنفذ الذي يعمل عليه تطبيق الويب | `4000` |
| `BACKEND_URL` | رابط الباك إند API | `http://localhost:5050` |

---

## 🛡️ إعداد Nginx كخادم وسيط وشهادة SSL (Nginx Reverse Proxy)

أنشئ ملف الإعدادات في Nginx:
```bash
sudo nano /etc/nginx/sites-available/alahlam-web
```

ضع الإعدادات التالية (مع استبدال `your-domain.com` برابط موقعك أو الآي بي):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

تفعيل الإعدادات وإعادة تشغيل Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/alahlam-web /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

لتفعيل شهادة SSL مجانية (HTTPS):
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 🛠️ أوامر التحكم بـ PM2
```bash
# متابعة السجلات المباشرة
pm2 logs alahlam-web

# إعادة التشغيل بعد أي تعديل
pm2 restart alahlam-web

# إيقاف التطبيق
pm2 stop alahlam-web
```

