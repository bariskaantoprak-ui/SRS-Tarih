export interface PremadeDeck {
  id: string;
  title: string;
  description: string;
  examType: 'KPSS' | 'TYT' | 'AYT';
  cardCount: number;
  cards: Array<{ front: string; back: string; tag: string }>;
}

export const PREMADE_DECKS: PremadeDeck[] = [
  // --- TARİH ---
  {
    id: 'osmanli-kurulus',
    title: 'Tarih: Osmanlı Kuruluş',
    description: 'Beylikten Devlete, İstanbul\'un Fethi ve Padişahlar.',
    examType: 'AYT',
    cardCount: 5,
    cards: [
      { front: "Osmanlı Devleti'nde ilk bakır parayı bastıran padişah?", back: "Osman Bey", tag: "Tarih-Osmanlı" },
      { front: "Osmanlı'da ilk düzenli ordu (Yaya ve Müsellem) kimin zamanında kuruldu?", back: "Orhan Bey", tag: "Tarih-Osmanlı" },
      { front: "Sırpsındığı Savaşı (1364) hangi padişah döneminde yapılmıştır?", back: "I. Murat", tag: "Tarih-Osmanlı" },
      { front: "İstanbul'u kuşatan ilk Osmanlı padişahı?", back: "Yıldırım Bayezid", tag: "Tarih-Osmanlı" },
      { front: "II. Mehmet (Fatih) hangi olay ile 'Fatih' unvanını almıştır?", back: "İstanbul'un Fethi", tag: "Tarih-Yükselme" }
    ]
  },
  {
    id: 'inkilap-tarihi',
    title: 'Tarih: İnkılap Tarihi',
    description: 'Kurtuluş Savaşı ve Atatürk İlkeleri.',
    examType: 'KPSS',
    cardCount: 5,
    cards: [
      { front: "Mustafa Kemal'in Samsun'a çıktığı tarih?", back: "19 Mayıs 1919", tag: "Tarih-İnkılap" },
      { front: "Amasya Genelgesi'ni kaleme alan kişi?", back: "Cevat Abbas", tag: "Tarih-İnkılap" },
      { front: "Milli sınırların ilk kez bahsedildiği kongre?", back: "Erzurum Kongresi", tag: "Tarih-İnkılap" },
      { front: "TBMM'yi tanıyan ilk Müslüman devlet?", back: "Afganistan", tag: "Tarih-İnkılap" },
      { front: "Saltanatın kaldırılması hangi ilke ile ilgilidir?", back: "Cumhuriyetçilik", tag: "Tarih-İlkeler" }
    ]
  },
  
  // --- EDEBİYAT ---
  {
    id: 'edebiyat-yazar-eser',
    title: 'Edebiyat: Yazar Eser',
    description: 'Tanzimat, Servet-i Fünun ve Milli Edebiyat eserleri.',
    examType: 'AYT',
    cardCount: 8,
    cards: [
      { front: "İntibah ve Namık Kemal'in yazdığı edebi tür nedir?", back: "İlk Edebi Roman", tag: "Edebiyat" },
      { front: "Mai ve Siyah kimin eseridir?", back: "Halit Ziya Uşaklıgil", tag: "Edebiyat" },
      { front: "Sinekli Bakkal romanının yazarı kimdir?", back: "Halide Edip Adıvar", tag: "Edebiyat" },
      { front: "Şair Evlenmesi'nin türü nedir?", back: "Tiyatro (İlk)", tag: "Edebiyat" },
      { front: "Safahat kimin eseridir?", back: "Mehmet Akif Ersoy", tag: "Edebiyat" },
      { front: "Yaban romanı kime aittir?", back: "Yakup Kadri Karaosmanoğlu", tag: "Edebiyat" },
      { front: "Çalıkuşu romanının baş karakteri?", back: "Feride", tag: "Edebiyat" },
      { front: "Beş Şehir denemesi kime aittir?", back: "Ahmet Hamdi Tanpınar", tag: "Edebiyat" }
    ]
  },

  // --- BİYOLOJİ ---
  {
    id: 'biyoloji-hucre',
    title: 'Biyoloji: Hücre ve Organeller',
    description: 'Hücre yapısı, organeller ve madde geçişleri.',
    examType: 'TYT',
    cardCount: 7,
    cards: [
      { front: "Hücrenin enerji santrali hangi organeldir?", back: "Mitokondri", tag: "Biyoloji" },
      { front: "Protein sentezinden sorumlu organel hangisidir?", back: "Ribozom", tag: "Biyoloji" },
      { front: "Bitki hücresinde fotosentez nerede gerçekleşir?", back: "Kloroplast", tag: "Biyoloji" },
      { front: "Hücre içi sindirimden sorumlu organel?", back: "Lizozom", tag: "Biyoloji" },
      { front: "Hücre zarının yapısı nasıldır?", back: "Seçici Geçirgen", tag: "Biyoloji" },
      { front: "ATP'nin yapısında bulunan şeker hangisidir?", back: "Riboz", tag: "Biyoloji" },
      { front: "DNA'nın yapı birimi nedir?", back: "Nükleotit", tag: "Biyoloji" }
    ]
  },

  // --- TÜRKÇE ---
  {
    id: 'turkce-yazim',
    title: 'Türkçe: Yazım Kuralları',
    description: 'Sıkça karıştırılan kelimeler ve yazım yanlışları.',
    examType: 'TYT',
    cardCount: 6,
    cards: [
      { front: "'Herkes' mi 'Herkez' mi?", back: "Herkes", tag: "Türkçe" },
      { front: "'Şey' kelimesi (her şey, bir şey) nasıl yazılır?", back: "Daima ayrı", tag: "Türkçe" },
      { front: "'Terk etmek' bitişik mi ayrı mı yazılır?", back: "Ayrı (Ses olayı yok)", tag: "Türkçe" },
      { front: "'Hissediyorum' bitişik mi ayrı mı?", back: "Bitişik (Ses türemesi var)", tag: "Türkçe" },
      { front: "TDK'nin mi TDK'nın mı?", back: "TDK'nin (K sesi KE diye okunur)", tag: "Türkçe" },
      { front: "Kısaltmalara gelen ekler neye göre gelir?", back: "Kısaltmanın okunuşuna göre", tag: "Türkçe" }
    ]
  }
];