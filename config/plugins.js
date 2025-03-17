module.exports = () => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.yandex.ru',
        port: '465',
        secure: true,
        auth: {
          user: 'info@timeproperty.ru',
          pass: 'xZ9p2DIL',
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: 'info@timeproperty.ru',
        defaultReplyTo: 'info@timeproperty.ru',
      },
    },
  },
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["Name"],
      },
    },
  },
});
