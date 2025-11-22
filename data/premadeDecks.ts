export interface PremadeDeck {
  id: string;
  title: string;
  description: string;
  examType: 'KPSS' | 'TYT' | 'AYT';
  cardCount: number;
  cards: Array<{ front: string; back: string; tag: string }>;
}

export const PREMADE_DECKS: PremadeDeck[] = [
  {
    id: 'islamiyet-oncesi',
    title: 'İslamiyet Öncesi Türk Tarihi',
    description: 'Kurultay, Töre, İlk Türk Devletleri ve Destanlar.',
    examType: 'TYT',
    cardCount: 10,
    cards: [
      { front: "Türk adının anlamı, Çin kaynaklarında ne olarak geçer?", back: "Miğfer", tag: "İslamiyet Öncesi" },
      { front: "Tarihte bilinen ilk Türk topluluğu hangisidir?", back: "İskitler (Sakalar)", tag: "İslamiyet Öncesi" },
      { front: "Türk tarihinde ikili teşkilatı ilk uygulayan devlet?", back: "Asya Hun Devleti", tag: "İslamiyet Öncesi" },
      { front: "Yerleşik hayata geçen ilk Türk devleti hangisidir?", back: "Uygurlar", tag: "İslamiyet Öncesi" },
      { front: "Türklerin kullandığı ilk alfabe?", back: "Göktürk Alfabesi", tag: "İslamiyet Öncesi" },
      { front: "Orhun Abideleri hangi devlet zamanında dikilmiştir?", back: "II. Göktürk (Kutluk)", tag: "İslamiyet Öncesi" },
      { front: "Museviliği kabul eden ilk ve tek Türk devleti?", back: "Hazarlar", tag: "İslamiyet Öncesi" },
      { front: "Dünyanın en uzun destanı olan Manas Destanı kime aittir?", back: "Kırgızlar", tag: "İslamiyet Öncesi" },
      { front: "İslamiyet öncesi Türk devletlerinde ölü aşına ne denir?", back: "Yuğ", tag: "Kültür Medeniyet" },
      { front: "Devlet işlerinin görüşülüp karara bağlandığı meclise ne ad verilir?", back: "Kurultay (Toy)", tag: "Kültür Medeniyet" }
    ]
  },
  {
    id: 'ilk-turk-islam',
    title: 'İlk Türk İslam Devletleri',
    description: 'Karahanlılar, Gazneliler, Büyük Selçuklu ve Eserler.',
    examType: 'KPSS',
    cardCount: 8,
    cards: [
      { front: "Orta Asya'da kurulan ilk Müslüman Türk devleti?", back: "Karahanlılar", tag: "Türk İslam" },
      { front: "Türk İslam tarihinin ilk yazılı eseri sayılan Kutadgu Bilig'in yazarı?", back: "Yusuf Has Hacip", tag: "Türk İslam" },
      { front: "Sultan unvanını kullanan ilk Türk hükümdarı?", back: "Gazneli Mahmut", tag: "Türk İslam" },
      { front: "Büyük Selçuklu Devleti'nin en parlak dönemi hangi hükümdardır?", back: "Sultan Melikşah", tag: "Türk İslam" },
      { front: "1071 Malazgirt Savaşı'nda Romen Diyojen'i yenen komutan?", back: "Sultan Alparslan", tag: "Türk İslam" },
      { front: "Nizamiye Medreseleri hangi vezir tarafından kurulmuştur?", back: "Nizamülmülk", tag: "Türk İslam" },
      { front: "Mısır'da kurulan ilk Türk İslam devleti?", back: "Tolunoğulları", tag: "Türk İslam" },
      { front: "Divan-ı Lügati't Türk'ün yazarı kimdir?", back: "Kaşgarlı Mahmut", tag: "Türk İslam" }
    ]
  },
  {
    id: 'osmanli-kurulus',
    title: 'Osmanlı Kuruluş ve Yükselme',
    description: 'Beylikten Devlete, İstanbul\'un Fethi ve Kanuni Dönemi.',
    examType: 'AYT',
    cardCount: 10,
    cards: [
      { front: "Osmanlı Devleti'nde ilk bakır parayı bastıran padişah?", back: "Osman Bey", tag: "Osmanlı Kuruluş" },
      { front: "Osmanlı'da ilk düzenli ordu (Yaya ve Müsellem) kimin zamanında kuruldu?", back: "Orhan Bey", tag: "Osmanlı Kuruluş" },
      { front: "Sırpsındığı Savaşı (1364) hangi padişah döneminde yapılmıştır?", back: "I. Murat", tag: "Osmanlı Kuruluş" },
      { front: "İstanbul'u kuşatan ilk Osmanlı padişahı?", back: "Yıldırım Bayezid", tag: "Osmanlı Kuruluş" },
      { front: "Osmanlı Devleti'nin ikinci kurucusu sayılan padişah?", back: "Çelebi Mehmet", tag: "Osmanlı Kuruluş" },
      { front: "II. Mehmet (Fatih) hangi olay ile 'Fatih' unvanını almıştır?", back: "İstanbul'un Fethi", tag: "Osmanlı Yükselme" },
      { front: "Mısır Seferi ile Halifeliği Osmanlı'ya getiren padişah?", back: "Yavuz Sultan Selim", tag: "Osmanlı Yükselme" },
      { front: "Preveze Deniz Zaferi'nin ünlü kaptan-ı deryası?", back: "Barbaros Hayrettin Paşa", tag: "Osmanlı Yükselme" },
      { front: "Kanuni Sultan Süleyman'ın son seferi?", back: "Zigetvar Seferi", tag: "Osmanlı Yükselme" },
      { front: "Fatih Sultan Mehmet döneminde hazırlanan kanunname?", back: "Kanunname-i Ali Osman", tag: "Osmanlı Kültür" }
    ]
  },
  {
    id: 'inkilap-tarihi',
    title: 'İnkılap Tarihi',
    description: 'Kurtuluş Savaşı, Kongreler ve Atatürk İlke ve İnkılapları.',
    examType: 'KPSS',
    cardCount: 10,
    cards: [
      { front: "Mustafa Kemal'in Samsun'a çıktığı tarih?", back: "19 Mayıs 1919", tag: "İnkılap Tarihi" },
      { front: "Amasya Genelgesi'ni kaleme alan kişi?", back: "Cevat Abbas", tag: "İnkılap Tarihi" },
      { front: "Milli sınırların ilk kez bahsedildiği kongre?", back: "Erzurum Kongresi", tag: "İnkılap Tarihi" },
      { front: "Temsil Heyeti'nin yetkilerinin tüm yurdu kapsadığı kongre?", back: "Sivas Kongresi", tag: "İnkılap Tarihi" },
      { front: "TBMM'yi tanıyan ilk Müslüman devlet?", back: "Afganistan", tag: "İnkılap Tarihi" },
      { front: "İstiklal Marşı hangi savaşın sonucunda kabul edilmiştir?", back: "I. İnönü Savaşı", tag: "İnkılap Tarihi" },
      { front: "Ordunun Sakarya Nehri'nin doğusuna çekildiği savaş?", back: "Kütahya-Eskişehir", tag: "İnkılap Tarihi" },
      { front: "Mustafa Kemal'e 'Gazilik' ve 'Mareşallik' unvanı verilen savaş?", back: "Sakarya Meydan Muharebesi", tag: "İnkılap Tarihi" },
      { front: "Saltanatın kaldırılması hangi ilke ile doğrudan ilgilidir?", back: "Cumhuriyetçilik", tag: "Atatürk İlkeleri" },
      { front: "Kadınlara seçme ve seçilme hakkı verilmesi hangi ilke ile ilgilidir?", back: "Halkçılık", tag: "Atatürk İlkeleri" }
    ]
  }
];