declare namespace Phone {
  declare namespace Mails {
    type DBMail = Omit<MailData, 'coords'> & Pick<Mail, 'date'> & { coords?: string };

    type Mail = {
      id: string;
      date: number;
    } & MailData;

    type MailData = {
      sender: string;
      subject: string;
      message: string;
      coords?: Vec3;
    };
  }
}
