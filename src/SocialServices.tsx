import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { addDoc, collection, updateDoc, doc, increment, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { formatValueWithCurrency } from "./currencies";
import { ArrowLeft, Menu, X, Check, Search, PlusCircle, LayoutDashboard, List, ShoppingCart, Tag, Facebook, Youtube, Instagram, Twitter, Music, PlaySquare, Headphones, MessageCircle, Send, Cloud, Globe, Linkedin, Twitch, Loader2 } from "lucide-react";

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    backToApp: "Back to App",
    newOrder: "New order",
    services: "Services",
    myOrders: "My Orders",
    balance: "Balance",
    search: "Search category...",
    category: "Category",
    service: "Service",
    link: "Link",
    quantity: "Quantity",
    charge: "Charge",
    submit: "Submit",
    serviceDetails: "Service Details",
    description: "Description",
    loadingServices: "Loading services...",
    selectCategory: "Select a category",
    selectService: "Select a service",
    noCategories: "No categories found",
    loadingOrders: "Loading your orders...",
    noOrdersYet: "No orders yet",
    noOrdersSub: "You haven't placed any social panel orders. When you do, they will appear here.",
    orderPlacing: "Processing order...",
    orderPlaced: "Order placed successfully!",
    insufficientBalance: "Insufficient balance to place this order.",
    linkRequired: "Link is required.",
    qtyRequired: "Quantity is required.",
    qtyRange: "Quantity must be between min and max.",
    orderId: "Order ID",
    status: "Status",
    date: "Date",
    amountPaid: "Amount Paid",
    targetUrl: "Target URL"
  },
  bn: {
    backToApp: "অ্যাপে ফিরুন",
    newOrder: "নতুন অর্ডার",
    services: "সার্ভিস সমূহ",
    myOrders: "আমার অর্ডারসমূহ",
    balance: "ব্যালেন্স",
    search: "ক্যাটাগরি খুঁজুন...",
    category: "ক্যাটাগরি",
    service: "সার্ভিস",
    link: "লিংক",
    quantity: "পরিমাণ",
    charge: "চার্জ",
    submit: "সাবমিট করুন",
    serviceDetails: "সার্ভিস বিবরণ",
    description: "বিবরণ",
    loadingServices: "সার্ভিস লোড হচ্ছে...",
    selectCategory: "একটি ক্যাটাগরি বেছে নিন",
    selectService: "একটি সার্ভিস বেছে নিন",
    noCategories: "কোনো ক্যাটাগরি পাওয়া যায়নি",
    loadingOrders: "অর্ডার লোড হচ্ছে...",
    noOrdersYet: "কোনো অর্ডার নেই",
    noOrdersSub: "আপনার কোনো সোশ্যাল প্যানেল অর্ডার নেই। অর্ডার করার পর তা এখানে দেখা যাবে।",
    orderPlacing: "অর্ডার প্রসেস হচ্ছে...",
    orderPlaced: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
    insufficientBalance: "অর্ডার করার জন্য পর্যাপ্ত ব্যালেন্স নেই।",
    linkRequired: "লিংক দিতে হবে।",
    qtyRequired: "পরিমাণ দিতে হবে।",
    qtyRange: "পরিমাণ অবশ্যই সর্বনিম্ন এবং সর্বোচ্চ সীমার মধ্যে হতে হবে।",
    orderId: "অর্ডার আইডি",
    status: "স্ট্যাটাস",
    date: "তারিখ",
    amountPaid: "মোট প্রদেয়",
    targetUrl: "টার্গেট লিংক"
  },
  hi: {
    backToApp: "ऐप पर वापस",
    newOrder: "नया ऑर्डर",
    services: "सेवाएं",
    myOrders: "मेरे ऑर्डर",
    balance: "बैलेंस",
    search: "श्रेणी खोजें...",
    category: "श्रेणी",
    service: "सेवा",
    link: "लिंक",
    quantity: "मात्रा",
    charge: "शुल्क",
    submit: "जमा करें",
    serviceDetails: "सेवा विवरण",
    description: "विवरण",
    loadingServices: "सेवाएं लोड हो रही हैं...",
    selectCategory: "श्रेणी चुनें",
    selectService: "सेवा चुनें",
    noCategories: "कोई श्रेणी नहीं मिली",
    loadingOrders: "आपके ऑर्डर लोड हो रहे हैं...",
    noOrdersYet: "अभी तक कोई ऑर्डर नहीं",
    noOrdersSub: "आपने अभी तक कोई सोशल पैनल ऑर्डर नहीं दिया है। जब आप करेंगे, तो वे यहाँ दिखाई देंगे।",
    orderPlacing: "ऑर्डर प्रोसेस हो रहा है...",
    orderPlaced: "ऑर्डर सफलतापूर्वक सबमिट हो गया!",
    insufficientBalance: "इस ऑर्डर के लिए पर्याप्त बैलेंस नहीं है।",
    linkRequired: "लिंक आवश्यक है।",
    qtyRequired: "मात्रा आवश्यक है।",
    qtyRange: "मात्रा न्यूनतम और अधिकतम के बीच होनी चाहिए।",
    orderId: "ऑर्डर आईडी",
    status: "स्थिति",
    date: "दिनांक",
    amountPaid: "भुगतान की गई राशि",
    targetUrl: "लक्ष्य यूआरएल"
  },
  es: {
    backToApp: "Volver",
    newOrder: "Nuevo pedido",
    services: "Servicios",
    myOrders: "Mis pedidos",
    balance: "Saldo",
    search: "Buscar categoría...",
    category: "Categoría",
    service: "Servicio",
    link: "Enlace",
    quantity: "Cantidad",
    charge: "Costo",
    submit: "Enviar",
    serviceDetails: "Detalles",
    description: "Descripción",
    loadingServices: "Cargando servicios...",
    selectCategory: "Seleccionar Categoría",
    selectService: "Seleccionar Servicio",
    noCategories: "Categorías no encontradas",
    loadingOrders: "Cargando pedidos...",
    noOrdersYet: "Sin pedidos",
    noOrdersSub: "Aún no ha realizado ningún pedido en el panel social.",
    orderPlacing: "Procesando pedido...",
    orderPlaced: "¡Pedido realizado con éxito!",
    insufficientBalance: "Saldo insuficiente.",
    linkRequired: "Enlace es requerido.",
    qtyRequired: "Cantidad es requerida.",
    qtyRange: "La cantidad debe estar entre el mín y máx.",
    orderId: "ID Pedido",
    status: "Estado",
    date: "Fecha",
    amountPaid: "Total pagado",
    targetUrl: "URL de destino"
  },
  ar: {
    backToApp: "العودة للتطبيق",
    newOrder: "طلب جديد",
    services: "الخدمات",
    myOrders: "طلباتي",
    balance: "الرصيد",
    search: "البحث عن قسم...",
    category: "الفئة",
    service: "الخدمة",
    link: "الرابط",
    quantity: "الكمية",
    charge: "التكلفة",
    submit: "إرسال",
    serviceDetails: "تفاصيل الخدمة",
    description: "الوصف",
    loadingServices: "جاري تحميل الخدمات...",
    selectCategory: "اختر القسم",
    selectService: "اختر الخدمة",
    noCategories: "لم يتم العثور على أقسام",
    loadingOrders: "جاري تحميل طلباتك...",
    noOrdersYet: "لا توجد طلبات بعد",
    noOrdersSub: "لم تقم بتقديم أي طلبات لوحة اجتماعية بعد. عند القيام بذلك، ستظهر هنا.",
    orderPlacing: "جاري تقديم الطلب...",
    orderPlaced: "تم تقديم الطلب بنجاح!",
    insufficientBalance: "الرصيد غير كافٍ لتقديم هذا الطلب.",
    linkRequired: "الرابط مطلوب.",
    qtyRequired: "الكمية مطلوبة.",
    qtyRange: "يجب أن تكون الكمية بين الحد الأدنى والأقصى.",
    orderId: "رقم الطلب",
    status: "الحالة",
    date: "التاريخ",
    amountPaid: "المبلغ المدفوع",
    targetUrl: "الرابط المستهدف"
  },
  ru: {
    backToApp: "Назад в приложение",
    newOrder: "Новый заказ",
    services: "Услуги",
    myOrders: "Мои заказы",
    balance: "Баланс",
    search: "Поиск категории...",
    category: "Категория",
    service: "Услуга",
    link: "Ссылка",
    quantity: "Количество",
    charge: "Цена",
    submit: "Купить",
    serviceDetails: "Детали услуги",
    description: "Описание",
    loadingServices: "Загрузка услуг...",
    selectCategory: "Выбрать категорию",
    selectService: "Выбрать услугу",
    noCategories: "Категории не найдены",
    loadingOrders: "Загрузка ваших заказов...",
    noOrdersYet: "Нет заказов",
    noOrdersSub: "Вы еще не создали ни одного заказа. Когда вы это сделаете, они появятся здесь.",
    orderPlacing: "Оформление заказа...",
    orderPlaced: "Заказ успешно создан!",
    insufficientBalance: "Недостаточно средств для этого заказа.",
    linkRequired: "Ссылка обязательна.",
    qtyRequired: "Количество обязательно.",
    qtyRange: "Количество должно быть в допустимых пределах.",
    orderId: "ID заказа",
    status: "Статус",
    date: "Дата",
    amountPaid: "Оплачено",
    targetUrl: "Целевая ссылка"
  },
  pt: { backToApp: "Voltar", newOrder: "Novo pedido", services: "Serviços", myOrders: "Meus pedidos", balance: "Saldo", search: "Buscar categoria...", category: "Categoria", service: "Serviço", link: "Link", quantity: "Quantidade", charge: "Preço", submit: "Enviar", serviceDetails: "Detalhes", description: "Descrição", loadingServices: "Carregando...", selectCategory: "Selecione uma categoria", selectService: "Selecione um serviço", noCategories: "Nenhuma categoria encontrada", loadingOrders: "Carregando...", noOrdersYet: "Sem pedidos", noOrdersSub: "Você ainda não fez nenhum pedido.", orderPlacing: "Processando...", orderPlaced: "Pedido feito com sucesso!", insufficientBalance: "Saldo insuficiente.", linkRequired: "Link obrigatório.", qtyRequired: "Quantidade obrigatória.", qtyRange: "Quantidade inválida.", orderId: "ID", status: "Status", date: "Data", amountPaid: "Pago", targetUrl: "URL" },
  fr: { backToApp: "Retour", newOrder: "Nouveau", services: "Services", myOrders: "Mes commandes", balance: "Solde", search: "Rechercher...", category: "Catégorie", service: "Service", link: "Lien", quantity: "Quantité", charge: "Coût", submit: "Acheter", serviceDetails: "Détails", description: "Description", loadingServices: "Chargement...", selectCategory: "Choisir", selectService: "Choisir", noCategories: "Aucune", loadingOrders: "Chargement...", noOrdersYet: "Aucune commande", noOrdersSub: "Aucune commande.", orderPlacing: "En cours...", orderPlaced: "Succès !", insufficientBalance: "Solde insuffisant.", linkRequired: "Lien requis.", qtyRequired: "Quantité requise.", qtyRange: "Quantité invalide.", orderId: "ID", status: "Statut", date: "Date", amountPaid: "Payé", targetUrl: "Lien" },
  de: { backToApp: "Zurück", newOrder: "Neuer Auftrag", services: "Dienste", myOrders: "Bestellungen", balance: "Guthaben", search: "Suchen...", category: "Kategorie", service: "Dienst", link: "Link", quantity: "Menge", charge: "Kosten", submit: "Kaufen", serviceDetails: "Details", description: "Beschreibung", loadingServices: "Laden...", selectCategory: "Kategorie wählen", selectService: "Dienst wählen", noCategories: "Keine gefunden", loadingOrders: "Laden...", noOrdersYet: "Keine Bestellungen", noOrdersSub: "Keine Bestellungen.", orderPlacing: "Wird verarbeitet...", orderPlaced: "Erfolgreich !", insufficientBalance: "Zu wenig Guthaben.", linkRequired: "Link erforderlich.", qtyRequired: "Menge erforderlich.", qtyRange: "Menge ungültig.", orderId: "ID", status: "Status", date: "Datum", amountPaid: "Bezahlt", targetUrl: "Link" },
  zh: { backToApp: "返回应用", newOrder: "新订单", services: "服务", myOrders: "我的订单", balance: "余额", search: "搜索...", category: "分类", service: "服务", link: "链接", quantity: "数量", charge: "费用", submit: "提交", serviceDetails: "详情", description: "描述", loadingServices: "加载中...", selectCategory: "选择分类", selectService: "选择服务", noCategories: "未找到分类", loadingOrders: "加载中...", noOrdersYet: "暂无订单", noOrdersSub: "暂无订单。", orderPlacing: "处理中...", orderPlaced: "订单提交成功！", insufficientBalance: "余额不足。", linkRequired: "链接必填。", qtyRequired: "数量必填。", qtyRange: "数量范围错误。", orderId: "订单ID", status: "状态", date: "日期", amountPaid: "已付金额", targetUrl: "目标链接" },
  ja: { backToApp: "アプリに戻る", newOrder: "新規注文", services: "サービス", myOrders: "注文履歴", balance: "残高", search: "検索...", category: "カテゴリ", service: "サービス", link: "リンク", quantity: "数量", charge: "料金", submit: "送信", serviceDetails: "詳細", description: "説明", loadingServices: "読込中...", selectCategory: "選択してください", selectService: "選択してください", noCategories: "なし", loadingOrders: "読込中...", noOrdersYet: "注文なし", noOrdersSub: "注文履歴はありません。", orderPlacing: "処理中...", orderPlaced: "注文完了！", insufficientBalance: "残高不足。", linkRequired: "リンク必須。", qtyRequired: "数量必須。", qtyRange: "数量が無効です。", orderId: "ID", status: "ステータス", date: "日付", amountPaid: "支払額", targetUrl: "URL" },
  ko: { backToApp: "앱으로 가기", newOrder: "신규 주문", services: "서비스 목록", myOrders: "주문 내역", balance: "잔액", search: "검색...", category: "카테고리", service: "서비스", link: "링크", quantity: "수량", charge: "비용", submit: "주문하기", serviceDetails: "상세", description: "설명", loadingServices: "로딩중...", selectCategory: "선택", selectService: "선택", noCategories: "없음", loadingOrders: "로딩중...", noOrdersYet: "주문 없음", noOrdersSub: "주문 내역이 없습니다.", orderPlacing: "처리중...", orderPlaced: "주문 성공!", insufficientBalance: "잔액 부족.", linkRequired: "링크 필수.", qtyRequired: "수량 필수.", qtyRange: "수량 오류.", orderId: "ID", status: "상태", date: "날짜", amountPaid: "결제액", targetUrl: "URL" },
  tr: { backToApp: "Geri Dön", newOrder: "Yeni Sipariş", services: "Servisler", myOrders: "Siparişlerim", balance: "Bakiye", search: "Ara...", category: "Kategori", service: "Servis", link: "Link", quantity: "Miktar", charge: "Ücret", submit: "Gönder", serviceDetails: "Detaylar", description: "Açıklama", loadingServices: "Yükleniyor...", selectCategory: "Kategori seç", selectService: "Servis seç", noCategories: "Bulunamadı", loadingOrders: "Yükleniyor...", noOrdersYet: "Sipariş yok", noOrdersSub: "Siparişiniz bulunmamaktadır.", orderPlacing: "İşleniyor...", orderPlaced: "Sipariş tamamlandı!", insufficientBalance: "Bakiye yetersiz.", linkRequired: "Link gerekli.", qtyRequired: "Miktar gerekli.", qtyRange: "Miktar geçersiz.", orderId: "ID", status: "Durum", date: "Tarih", amountPaid: "Ödenen", targetUrl: "Link" },
  id: { backToApp: "Kembali", newOrder: "Pesanan Baru", services: "Layanan", myOrders: "Pesanan Saya", balance: "Saldo", search: "Cari...", category: "Kategori", service: "Layanan", link: "Link", quantity: "Jumlah", charge: "Biaya", submit: "Kirim", serviceDetails: "Detail", description: "Deskripsi", loadingServices: "Memuat...", selectCategory: "Pilih", selectService: "Pilih", noCategories: "Tidak ada", loadingOrders: "Memuat...", noOrdersYet: "Belum ada pesanan", noOrdersSub: "Belum ada pesanan.", orderPlacing: "Memproses...", orderPlaced: "Pesanan berhasil!", insufficientBalance: "Saldo kurang.", linkRequired: "Link wajib.", qtyRequired: "Jumlah wajib.", qtyRange: "Jumlah tidak valid.", orderId: "ID", status: "Status", date: "Tanggal", amountPaid: "Dibayar", targetUrl: "Link" },
  ur: { backToApp: "واپس جائیں", newOrder: "نیا آرڈر", services: "سروسز", myOrders: "میرے آرڈر", balance: "بیلنس", search: "تلاش...", category: "کیٹیگری", service: "سروس", link: "لنک", quantity: "تعداد", charge: "قیمत", submit: "جمع کریں", serviceDetails: "تفصیلات", description: "تفصیل", loadingServices: "لوڈ ہو رہا ہے...", selectCategory: "منتخب کریں", selectService: "منتخب کریں", noCategories: "کوئی نہیں", loadingOrders: "لوڈ ہو رہا ہے...", noOrdersYet: "کوئی آرڈر نہیں", noOrdersSub: "کوئی آرڈر نہیں ہے۔", orderPlacing: "پروسیس ہو رہا ہے...", orderPlaced: "آرڈر جمع ہو گیا!", insufficientBalance: "بیلنس کم ہے۔", linkRequired: "لنک لازمی ہے۔", qtyRequired: "تعداد لازمی ہے۔", qtyRange: "تعداد غلط ہے۔", orderId: "آرڈر ID", status: "حالت", date: "تاریخ", amountPaid: "رقم", targetUrl: "لنک" },
  it: { backToApp: "Indietro", newOrder: "Nuovo ordine", services: "Servizi", myOrders: "I miei ordini", balance: "Saldo", search: "Cerca...", category: "Categoria", service: "Servizio", link: "Link", quantity: "Quantità", charge: "Prezzo", submit: "Invia", serviceDetails: "Dettagli", description: "Descrizione", loadingServices: "Caricamento...", selectCategory: "Seleziona", selectService: "Seleziona", noCategories: "Nessuna", loadingOrders: "Caricamento...", noOrdersYet: "Nessun ordine", noOrdersSub: "Nessun ordine presente.", orderPlacing: "In corso...", orderPlaced: "Successo!", insufficientBalance: "Saldo insufficiente.", linkRequired: "Link richiesto.", qtyRequired: "Quantità richiesta.", qtyRange: "Quantità non valida.", orderId: "ID", status: "Stato", date: "Data", amountPaid: "Pagato", targetUrl: "Link" },
  nl: { backToApp: "Terug", newOrder: "Nieuwe bestelling", services: "Diensten", myOrders: "Mijn bestellingen", balance: "Saldo", search: "Zoeken...", category: "Categorie", service: "Dienst", link: "Link", quantity: "Aantal", charge: "Kosten", submit: "Kopen", serviceDetails: "Details", description: "Beschrijving", loadingServices: "Laden...", selectCategory: "Kies", selectService: "Kies", noCategories: "Geen", loadingOrders: "Laden...", noOrdersYet: "Geen bestellingen", noOrdersSub: "Geen bestellingen.", orderPlacing: "Verwerken...", orderPlaced: "Succes!", insufficientBalance: "Saldo ontoereikend.", linkRequired: "Link vereist.", qtyRequired: "Aantal vereist.", qtyRange: "Aantal ongeldig.", orderId: "ID", status: "Status", date: "Datum", amountPaid: "Betaald", targetUrl: "Link" },
  pl: { backToApp: "Wróć", newOrder: "Nowe zlecenie", services: "Usługi", myOrders: "Moje zamówienia", balance: "Saldo", search: "Szukaj...", category: "Kategoria", service: "Usługa", link: "Link", quantity: "Ilość", charge: "Koszt", submit: "Wyślij", serviceDetails: "Szczegóły", description: "Opis", loadingServices: "Ładowanie...", selectCategory: "Wybierz", selectService: "Wybierz", noCategories: "Brak", loadingOrders: "Ładowanie...", noOrdersYet: "Brak zamówień", noOrdersSub: "Brak zamówień.", orderPlacing: "Przetwarzanie...", orderPlaced: "Złożono!", insufficientBalance: "Brak środków.", linkRequired: "Link wymagany.", qtyRequired: "Ilość wymagana.", qtyRange: "Ilość niepoprawna.", orderId: "ID", status: "Status", date: "Data", amountPaid: "Opłacono", targetUrl: "Link" },
  vi: { backToApp: "Quay lại", newOrder: "Đơn hàng mới", services: "Dịch vụ", myOrders: "Đơn hàng của tôi", balance: "Số dư", search: "Tìm kiếm...", category: "Danh mục", service: "Dịch vụ", link: "Liên kết", quantity: "Số lượng", charge: "Phí", submit: "Gửi", serviceDetails: "Chi tiết", description: "Mô tả", loadingServices: "Đang tải...", selectCategory: "Chọn danh mục", selectService: "Chọn dịch vụ", noCategories: "Không tìm thấy", loadingOrders: "Đang tải...", noOrdersYet: "Chưa có đơn hàng", noOrdersSub: "Chưa có đơn hàng.", orderPlacing: "Đang xử lý...", orderPlaced: "Thành công!", insufficientBalance: "Không đủ số dư.", linkRequired: "Yêu cầu liên kết.", qtyRequired: "Yêu cầu số lượng.", qtyRange: "Số lượng không hợp lệ.", orderId: "ID", status: "Trạng thái", date: "Ngày", amountPaid: "Thanh toán", targetUrl: "URL" },
  th: { backToApp: "กลับ", newOrder: "สั่งซื้อใหม่", services: "บริการ", myOrders: "คำสั่งซื้อ", balance: "ยอดเงิน", search: "ค้นหา...", category: "หมวดหมู่", service: "บริการ", link: "ลิงก์", quantity: "จำนวน", charge: "ราคา", submit: "สั่งซื้อ", serviceDetails: "รายละเอียด", description: "คำอธิบาย", loadingServices: "กำลังโหลด...", selectCategory: "เลือก", selectService: "เลือก", noCategories: "ไม่พบ", loadingOrders: "กำลังโหลด...", noOrdersYet: "ไม่มีคำสั่งซื้อ", noOrdersSub: "ไม่มีคำสั่งซื้อ.", orderPlacing: "กำลังประมวลผล...", orderPlaced: "สั่งซื้อสำเร็จ!", insufficientBalance: "ยอดเงินไม่พอ", linkRequired: "ต้องการลิงก์", qtyRequired: "ต้องการจำนวน", qtyRange: "จำนวนไม่ถูกต้อง", orderId: "ID", status: "สถานะ", date: "วันที่", amountPaid: "ชำระเงิน", targetUrl: "ลิงก์" },
  ms: { backToApp: "Kembali", newOrder: "Pesanan Baru", services: "Perkhidmatan", myOrders: "Pesanan Saya", balance: "Baki", search: "Cari...", category: "Kategori", service: "Perkhidmatan", link: "Pautan", quantity: "Jumlah", charge: "Caj", submit: "Hantar", serviceDetails: "Butiran", description: "Keterangan", loadingServices: "Memuat...", selectCategory: "Pilih", selectService: "Pilih", noCategories: "Tiada", loadingOrders: "Memuat...", noOrdersYet: "Tiada pesanan", noOrdersSub: "Tiada pesanan.", orderPlacing: "Memproses...", orderPlaced: "Berjaya!", insufficientBalance: "Baki tidak mencukupi.", linkRequired: "Pautan wajib.", qtyRequired: "Jumlah wajib.", qtyRange: "Jumlah salah.", orderId: "ID", status: "Status", date: "Tarikh", amountPaid: "Dibayar", targetUrl: "Pautan" },
  tl: { backToApp: "Bumalik", newOrder: "Bagong Order", services: "Mga Serbisyo", myOrders: "Aking Orders", balance: "Balanse", search: "Maghanap...", category: "Kategorya", service: "Serbisyo", link: "Link", quantity: "Dami", charge: "Bayad", submit: "I-submit", serviceDetails: "Mga Detalye", description: "Paglalarawan", loadingServices: "Naglo-load...", selectCategory: "Pumili", selectService: "Pumili", noCategories: "Wala", loadingOrders: "Naglo-load...", noOrdersYet: "Walang orders", noOrdersSub: "Walang orders.", orderPlacing: "Prinoseso...", orderPlaced: "Tagumpay!", insufficientBalance: "Kulang ang balanse.", linkRequired: "Kailangan ng link.", qtyRequired: "Kailangan ng dami.", qtyRange: "Maling dami.", orderId: "ID", status: "Katayuan", date: "Petsa", amountPaid: "Bayad", targetUrl: "Link" },
  fa: { backToApp: "بازگشت", newOrder: "سفارش جدید", services: "خدمات", myOrders: "سفارشات من", balance: "موجودی", search: "جستجو...", category: "دسته‌بندی", service: "سرویس", link: "لینک", quantity: "تعداد", charge: "هزینه", submit: "ثبت", serviceDetails: "جزئیات", description: "توضیحات", loadingServices: "در حال بارگذاری...", selectCategory: "انتخاب", selectService: "انتخاب", noCategories: "یافت نشد", loadingOrders: "در حال بارگذاری...", noOrdersYet: "بدون سفارش", noOrdersSub: "هیچ سفارشی ندارید.", orderPlacing: "در حال پردازش...", orderPlaced: "موفقیت‌آمیز!", insufficientBalance: "موجودی ناکافی.", linkRequired: "لینک الزامی است.", qtyRequired: "تعداد الزامی است.", qtyRange: "تعداد نامعتبر.", orderId: "ID", status: "وضعیت", date: "تاریخ", amountPaid: "پرداخت شده", targetUrl: "لینک" },
  uk: { backToApp: "Назад", newOrder: "Нове замовлення", services: "Послуги", myOrders: "Мої замовлення", balance: "Баланс", search: "Пошук...", category: "Категорія", service: "Послуга", link: "Посилання", quantity: "Кількість", charge: "Вартість", submit: "Надіслати", serviceDetails: "Деталі", description: "Опис", loadingServices: "Завантаження...", selectCategory: "Вибрати", selectService: "Вибрати", noCategories: "Не знайдено", loadingOrders: "Завантаження...", noOrdersYet: "Немає замовлень", noOrdersSub: "Немає замовлень.", orderPlacing: "Обробка...", orderPlaced: "Успішно!", insufficientBalance: "Недостатньо коштів.", linkRequired: "Посилання обов'язкове.", qtyRequired: "Кількість обов'язкова.", qtyRange: "Невірна кількість.", orderId: "ID", status: "Статус", date: "Дата", amountPaid: "Сплачено", targetUrl: "Посилання" },
  ro: { backToApp: "Înapoi", newOrder: "Comandă nouă", services: "Servicii", myOrders: "Comenzile mele", balance: "Sold", search: "Caută...", category: "Categorie", service: "Serviciu", link: "Link", quantity: "Cantitate", charge: "Cost", submit: "Trimite", serviceDetails: "Detalii", description: "Descriere", loadingServices: "Se încarcă...", selectCategory: "Selectează", selectService: "Selectează", noCategories: "Nu s-a găsit", loadingOrders: "Se încarcă...", noOrdersYet: "Fără comenzi", noOrdersSub: "Nu aveți comenzi.", orderPlacing: "Se procesează...", orderPlaced: "Succes!", insufficientBalance: "Sold insuficient.", linkRequired: "Link obligatoriu.", qtyRequired: "Cantitate obligatorie.", qtyRange: "Cantitate invalidă.", orderId: "ID", status: "Status", date: "Dată", amountPaid: "Plătit", targetUrl: "Link" }
};

interface SocialServicesProps {
  currentUser: any;
  onNavigate: (view: any) => void;
  balanceUSD: number;
  socialMarkupPercent: number;
  smmMarkupData?: Record<string, any>;
  smmCategoryGroupName?: string;
  lang?: string;
  displayCurrency?: string;
}

export default function SocialServices({ currentUser, onNavigate, balanceUSD, socialMarkupPercent = 25, smmMarkupData = {}, smmCategoryGroupName = "social", lang = "en", displayCurrency = "USD" }: SocialServicesProps) {
  const currentLang = TRANSLATIONS[lang] ? lang : "en";
  const t = new Proxy(TRANSLATIONS[currentLang] || TRANSLATIONS.en, {
    get(target, prop: string) {
      return target[prop] || TRANSLATIONS.en[prop] || prop;
    }
  }) as unknown as Record<string, string>;

  const formatSmmCurrency = (amountUSD: number) => {
    return formatValueWithCurrency(amountUSD, displayCurrency);
  };

  const [activeTab, setActiveTab] = useState("new-order");
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchCategory, setSearchCategory] = useState("");
  
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [errors, setErrors] = useState<{link?: string, quantity?: string, general?: string}>({});
  
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const getCategoryIcon = (categoryName: string) => {
     if (!categoryName) return <Tag className="text-gray-400 w-5 h-5 shrink-0" />;
     const lower = categoryName.toLowerCase();
     if (lower.includes("youtube")) return <Youtube className="text-red-500 w-5 h-5 shrink-0" />;
     if (lower.includes("facebook")) return <Facebook className="text-[#1877F2] w-5 h-5 shrink-0" />;
     if (lower.includes("instagram")) return <Instagram className="text-pink-500 w-5 h-5 shrink-0" />;
     if (lower.includes("twitter") || lower.includes(" x ")) return <Twitter className="text-gray-800 w-5 h-5 shrink-0" />;
     if (lower.includes("spotify")) return <Headphones className="text-[#1DB954] w-5 h-5 shrink-0" />;
     if (lower.includes("tiktok")) return <PlaySquare className="text-gray-800 w-5 h-5 shrink-0" />;
     if (lower.includes("linkedin")) return <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="LinkedIn" />;
     if (lower.includes("telegram")) return <Send className="text-[#2AABEE] w-5 h-5 shrink-0" />;
     if (lower.includes("discord")) return <MessageCircle className="text-[#5865F2] w-5 h-5 shrink-0" />;
     if (lower.includes("soundcloud")) return <Cloud className="text-[#FF5500] w-5 h-5 shrink-0" />;
     if (lower.includes("twitch")) return <Twitch className="text-[#9146FF] w-5 h-5 shrink-0" />;
     if (lower.includes("website")) return <span className="text-xl leading-none">🌍</span>;
     if (lower.includes("shopee")) return <img src="https://www.google.com/s2/favicons?domain=shopee.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Shopee" />;
     if (lower.includes("lazada")) return <img src="https://www.google.com/s2/favicons?domain=lazada.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Lazada" />;
     if (lower.includes("yandex")) return <img src="https://www.google.com/s2/favicons?domain=yandex.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Yandex" />;
     if (lower.includes("reverbnation")) return <img src="https://www.google.com/s2/favicons?domain=reverbnation.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Reverbnation" />;
     
     if (lower.includes("mobile legend")) return <img src="https://www.google.com/s2/favicons?domain=mobilelegends.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Mobile Legends" />;
     if (lower.includes("freefire")) return <img src="https://www.google.com/s2/favicons?domain=ff.garena.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Free Fire" />;
     
     if (lower.includes("kwai")) return <img src="https://www.google.com/s2/favicons?domain=kwai.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Kwai" />;
     if (lower.includes("likee")) return <img src="https://www.google.com/s2/favicons?domain=likee.video&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Likee" />;
     if (lower.includes("lemon 8") || lower.includes("lemon8")) return <img src="https://www.google.com/s2/favicons?domain=lemon8-app.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Lemon 8" />;
     if (lower.includes("coub")) return <img src="https://www.google.com/s2/favicons?domain=coub.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Coub" />;
     
     if (lower.includes("mobile")) return <PlaySquare className="text-blue-500 w-5 h-5 shrink-0" />;
     if (lower.includes("pubg")) return <span className="text-xl leading-none">🪖</span>;
     if (lower.includes("kick")) return <span className="text-green-500 font-black italic text-lg leading-none shrink-0">K</span>;
     if (lower.includes("whatsapp")) return <MessageCircle className="text-green-500 w-5 h-5 shrink-0" />;
     if (lower.includes("threads")) return <span className="text-gray-900 font-bold text-base leading-none shrink-0">@</span>;
     if (lower.includes("snapchat")) return <span className="text-xl leading-none shrink-0">👻</span>;
     if (lower.includes("pinterest")) return <span className="text-xl leading-none shrink-0">📌</span>;
     if (lower.includes("reddit")) return <span className="text-orange-500 font-bold text-xl leading-none shrink-0">🤖</span>;
     if (lower.includes("vk")) return <img src="https://www.google.com/s2/favicons?domain=vk.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="VK" />;
     if (lower.includes("ok.ru") || lower.includes("ok ")) return <img src="https://www.google.com/s2/favicons?domain=ok.ru&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="OK.ru" />;
     if (lower.includes("tumblr")) return <span className="text-indigo-800 font-bold text-xl leading-none shrink-0">t</span>;
     
     if (lower.includes("indian")) return <span className="text-xl leading-none">🇮🇳</span>;
     if (lower.includes("bangladesh") || lower.includes("bd")) return <span className="text-xl leading-none">🇧🇩</span>;
     if (lower.includes("pakistan")) return <span className="text-xl leading-none">🇵🇰</span>;
     if (lower.includes("brazil")) return <span className="text-xl leading-none">🇧🇷</span>;
     if (lower.includes("usa") || lower.includes("united states") || lower.includes("us ")) return <span className="text-xl leading-none">🇺🇸</span>;
     if (lower.includes("indonesia")) return <span className="text-xl leading-none">🇮🇩</span>;
     if (lower.includes("nigeria")) return <span className="text-xl leading-none">🇳🇬</span>;
     if (lower.includes("egypt")) return <span className="text-xl leading-none">🇪🇬</span>;
     if (lower.includes("russia")) return <span className="text-xl leading-none">🇷🇺</span>;
     if (lower.includes("arab")) return <span className="text-xl leading-none">🇦🇪</span>;
     if (lower.includes("uk ") || lower.includes("united kingdom")) return <span className="text-xl leading-none">🇬🇧</span>;
     if (lower.includes("turkey") || lower.includes("turkish")) return <span className="text-xl leading-none">🇹🇷</span>;
  
     return <Tag className="text-gray-400 w-5 h-5 shrink-0" />;
  };

  useEffect(() => {
    fetchServices();
  }, [socialMarkupPercent, smmMarkupData]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      where("type", "==", "smm_order")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort descending by createdAt
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUserOrders(list);
      setOrdersLoading(false);
    }, (error) => {
      console.error("Error fetching SMM orders:", error);
      setOrdersLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/proxy/smm/services", { method: "POST" });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Apply dynamic markup
        const markupData = data.map(s => {
            let finalRate = parseFloat(s.rate);
            const override = smmMarkupData[s.service];
            
            if (override && override.type === 'fixed') {
                finalRate = finalRate + override.profit;
            } else {
                const defaultProfit = finalRate * socialMarkupPercent / 100;
                const profit = defaultProfit > 0.10 ? defaultProfit : 0.10;
                finalRate = finalRate + profit;
            }
            
            return {
                ...s,
                rate: finalRate.toFixed(4),
                originalRate: s.rate,
                desc: override?.description || s.desc || s.description || ""
            };
        });
        setServices(markupData);
        
        const cats = Array.from(new Set(markupData.map((s: any) => s.category)));
        setCategories(cats as string[]);
        if (cats.length > 0) {
           setSelectedCategory(cats[0] as string);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSocialFilter = (platform: string) => {
    setSearchCategory(platform);
    const lowercasePlatform = platform.toLowerCase();
    const firstMatch = categories.find(c => {
       const lowerC = c.toLowerCase();
       if (lowercasePlatform === "twitter" && lowerC.includes("x (")) return true;
       if (lowercasePlatform === "mobile" && lowerC.includes("mobile legends")) return true;
       return lowerC.includes(lowercasePlatform);
    });
    if (firstMatch) {
      setSelectedCategory(firstMatch);
      setShowCategoryDropdown(false);
    }
  };

  useEffect(() => {
    let newCategory = "Youtube";
    if (smmCategoryGroupName === "games") newCategory = "Freefire";
    else if (smmCategoryGroupName === "streaming") newCategory = "Spotify";
    else if (smmCategoryGroupName === "regional") newCategory = "Kwai";
    else if (smmCategoryGroupName === "ecommerce") newCategory = "Website";
    
    setSearchCategory(newCategory);
    if (categories.length > 0) {
       handleSocialFilter(newCategory);
    }
  }, [smmCategoryGroupName, categories.length]);

  const currentServices = services.filter(s => s.category === selectedCategory);
  const filteredCategories = categories.filter(c => {
    const lowerC = c.toLowerCase();
    const search = searchCategory.toLowerCase();
    if (search === 'twitter' && lowerC.includes('x (')) return true;
    if (search === 'mobile' && lowerC.includes('mobile legends')) return true;
    return lowerC.includes(search);
  });
  
  const isGameCategory = (cat: string) => /free\s*fire|pubg|mobile\s*legends/i.test(cat || '');

  useEffect(() => {
     if (currentServices.length > 0 && (!selectedService || selectedService.category !== selectedCategory)) {
         setSelectedService(currentServices[0]);
     }
  }, [selectedCategory, currentServices]);

  const charge = selectedService && quantity && !isNaN(Number(quantity))
    ? (isGameCategory(selectedService.category) ? (Number(quantity) * parseFloat(selectedService.rate)) : ((Number(quantity) / 1000) * parseFloat(selectedService.rate))).toFixed(4)
    : "0";

  const handlePlaceOrder = async () => {
     setErrors({});
     let newErrors: {link?: string, quantity?: string, general?: string} = {};
     let hasError = false;

     if (!selectedService) {
         toast.error(t.selectServiceFirst || "Please select a service first.");
         return;
     }
     if (!link.trim()) {
         newErrors.link = t.linkRequired || "Link is required.";
         hasError = true;
     }
     if (!quantity) {
         newErrors.quantity = t.qtyRequired || "Quantity is required.";
         hasError = true;
     } else if (Number(quantity) < Number(selectedService.min) || Number(quantity) > Number(selectedService.max)) {
        newErrors.quantity = (t.qtyRange || "Quantity must be between min and max.").replace("min", selectedService.min).replace("max", selectedService.max);
        hasError = true;
     }

     if (hasError) {
         setErrors(newErrors);
         toast.error(lang === "bn" ? "অর্ডার করার পূর্বে ত্রুটিগুলো ঠিক করুন।" : "Please fix the errors before placing the order.");
         return;
     }
     
     if (balanceUSD < Number(charge)) {
         toast.error(t.insufficientBalance || "Insufficient balance to place this order.");
         return;
     }

     const loadingToast = toast.loading(t.orderPlacing || "Processing order...");

     try {
       const res = await fetch("/api/proxy/smm/add", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               service: selectedService.service,
               link: link.trim(),
               quantity: Number(quantity)
           })
       });

       const data = await res.json();
       
       if (data.error) {
           toast.dismiss(loadingToast);
           toast.error(`SMM Error: ${data.error}`);
           return;
       }

       if (data.order) {
           // Success! Record transaction & deduct balance
           await Promise.all([
               addDoc(collection(db, "transactions"), {
                   type: "smm_order",
                   userId: currentUser?.uid,
                   userEmail: currentUser?.email,
                   providerOrderId: data.order,
                   serviceId: selectedService.service,
                   serviceName: selectedService.name,
                   category: selectedService.category,
                   link: link.trim(),
                   quantity: Number(quantity),
                   amountUSD: Number(charge),
                   status: "pending",
                   createdAt: Date.now()
               }),
               updateDoc(doc(db, "users", currentUser?.uid || ""), {
                   balanceUSD: increment(-Number(charge)),
                   total_spent: increment(Number(charge)),
                   last_update: Date.now()
               })
           ]);

           toast.dismiss(loadingToast);
           if (typeof (window as any).triggerPurchaseSuccess === "function") {
             (window as any).triggerPurchaseSuccess({
               title: selectedService.name,
               category: "SMM Social Service 🚀",
               priceUSD: Number(charge),
               details: {
                 "Order ID": data.order,
                 "SMM Category": selectedService.category,
                 "Target Link": link.trim(),
                 "Order Quantity": Number(quantity),
                 "Service ID": selectedService.service,
                 "Instructions": "Your SMM Order has been submitted and is currently being processed by our provider networks automatically!"
               }
             });
           } else {
             toast.success(`${t.orderPlaced || "Order placed successfully!"} ID: ${data.order}`);
           }
           setLink("");
           setQuantity("");
           setActiveTab("orders");
       } else {
           toast.dismiss(loadingToast);
           toast.error(lang === "bn" ? "অজানা সমস্যা। অর্ডার আইডি পাওয়া যায়নি।" : "An unknown error occurred. Order ID not received.");
       }
     } catch (err: any) {
         toast.dismiss(loadingToast);
         toast.error(lang === "bn" ? "নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।" : "Network or internal error while placing order.");
     }
  };

  const navItems = [
    { id: "new-order", label: t.newOrder, icon: PlusCircle },
    { id: "services", label: t.services, icon: List },
    { id: "orders", label: t.myOrders, icon: ShoppingCart },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-50 bg-transparent flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white text-gray-800 p-4 flex justify-between items-center shadow-sm z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
           <button onClick={() => onNavigate("dashboard")} className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-2">
             <div className="bg-[#2AABEE] text-white p-1 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.02-1.92 1.25-5.41 3.63-.51.35-.97.53-1.39.52-.46-.01-1.33-.26-1.97-.47-.79-.26-1.42-.4-1.37-.85.03-.23.36-.47.98-.71 3.86-1.68 6.43-2.79 7.71-3.32 3.67-1.51 4.43-1.78 4.93-1.79.11 0 .36.03.49.13.11.08.14.2.16.28.01.07.03.22.02.39z"/>
               </svg>
             </div>
             <h1 className="font-extrabold text-xl text-[#2AABEE] tracking-tight">{selectedCategory || "Social Panel"}</h1>
           </div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} transform md:translate-x-0 transition-transform duration-300 absolute md:relative z-30 w-64 h-full bg-white shadow-xl flex flex-col border-r border-gray-100`}>
         <div className="p-6 bg-white border-b border-gray-100 hidden md:block">
            <button onClick={() => onNavigate("dashboard")} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> {t.backToApp}
            </button>
            <div className="flex items-center gap-2">
               <div className="bg-[#2AABEE] text-white p-1.5 rounded-lg shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.02-1.92 1.25-5.41 3.63-.51.35-.97.53-1.39.52-.46-.01-1.33-.26-1.97-.47-.79-.26-1.42-.4-1.37-.85.03-.23.36-.47.98-.71 3.86-1.68 6.43-2.79 7.71-3.32 3.67-1.51 4.43-1.78 4.93-1.79.11 0 .36.03.49.13.11.08.14.2.16.28.01.07.03.22.02.39z"/>
                 </svg>
               </div>
               <h1 className="font-extrabold text-2xl text-[#2AABEE] tracking-tight">{selectedCategory || "Social Panel"}</h1>
            </div>
         </div>
         
         <div className="p-4 border-b border-gray-100 bg-[#f8fbff] flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : "U"}
             </div>
             <div>
                <div className="font-bold text-gray-800 truncate text-sm">
                   {currentUser?.displayName || currentUser?.email?.split('@')[0] || "User"}
                </div>
                <div className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-0.5 border border-blue-100">
                   {t.balance}: {formatSmmCurrency(balanceUSD)}
                </div>
             </div>
         </div>

         <div className="p-4 flex-1">
            <div className="space-y-1.5">
               {navItems.map(item => (
                 <button 
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === item.id ? "bg-[#2AABEE] text-white shadow-md shadow-blue-500/20" : "text-gray-600 hover:bg-gray-50 hover:text-[#2AABEE]"}`}
                 >
                   <item.icon className="w-5 h-5" />
                   {item.label}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 relative scroll-smooth">
         {/* Overlay for mobile sidebar */}
         {menuOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 md:hidden" onClick={() => setMenuOpen(false)} />}
         
         {activeTab === "new-order" && (
            <div className="max-w-2xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
               
               {/* Fund Card */}
               <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
                  <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-2 gap-3 pb-2">
                        {(() => {
                           let buttonsToRender: any[] = [];
                           if (smmCategoryGroupName === "games") {
                               buttonsToRender = [
                                  { label: "Free Fire", key: "Freefire", icon: <img src="https://www.google.com/s2/favicons?domain=ff.garena.com&sz=128" className="w-5 h-5 rounded-md" alt="Free Fire" /> },
                                  { label: "PUBG Mobile", key: "PUBG", icon: <span className="text-xl leading-none">🪖</span> },
                                  { label: "Mobile Legends", key: "Mobile", icon: <img src="https://www.google.com/s2/favicons?domain=mobilelegends.com&sz=128" className="w-5 h-5 rounded-md" alt="Mobile Legends" /> },
                               ];
                           } else if (smmCategoryGroupName === "streaming") {
                               buttonsToRender = [
                                  { label: "Twitch", key: "Twitch", icon: <Twitch className="text-[#9146FF] w-5 h-5" /> },
                                  { label: "Kick", key: "Kick", icon: <span className="text-green-500 font-black italic text-lg leading-none">K</span> },
                                  { label: "Spotify", key: "Spotify", icon: <span className="text-[#1DB954] text-xl leading-none">🎧</span> },
                                  { label: "SoundCloud", key: "SoundCloud", icon: <Cloud className="text-[#FF5500] w-5 h-5" /> },
                                  { label: "Audiomack", key: "Audiomack", icon: <span className="text-yellow-500 text-xl leading-none">🎶</span> },
                                  { label: "Deezer", key: "Deezer", icon: <span className="text-purple-500 text-xl leading-none">🎵</span> },
                                  { label: "Tidal", key: "Tidal", icon: <span className="text-black text-xl leading-none">🌊</span> },
                                  { label: "Vimeo", key: "Vimeo", icon: <span className="text-[#1AB7EA] font-bold text-xl leading-none">v</span> },
                               ];
                           } else if (smmCategoryGroupName === "regional") {
                               buttonsToRender = [
                                  { label: "Kwai", key: "Kwai", icon: <img src="https://www.google.com/s2/favicons?domain=kwai.com&sz=128" className="w-5 h-5 rounded-md" alt="Kwai" /> },
                                  { label: "Likee", key: "Likee", icon: <img src="https://www.google.com/s2/favicons?domain=likee.video&sz=128" className="w-5 h-5 rounded-md" alt="Likee" /> },
                                  { label: "VK", key: "VK", icon: <img src="https://www.google.com/s2/favicons?domain=vk.com&sz=128" className="w-5 h-5 rounded-md" alt="VK" /> },
                                  { label: "OK.ru", key: "OK.ru", icon: <img src="https://www.google.com/s2/favicons?domain=ok.ru&sz=128" className="w-5 h-5 rounded-md" alt="OK.ru" /> },
                                  { label: "Lemon 8", key: "Lemon", icon: <img src="https://www.google.com/s2/favicons?domain=lemon8-app.com&sz=128" className="w-5 h-5 rounded-md" alt="Lemon 8" /> },
                                  { label: "Coub", key: "Coub", icon: <img src="https://www.google.com/s2/favicons?domain=coub.com&sz=128" className="w-5 h-5 rounded-md" alt="Coub" /> },
                               ];
                           } else if (smmCategoryGroupName === "ecommerce") {
                               buttonsToRender = [
                                  { label: "Shopee", key: "Shopee", icon: <img src="https://www.google.com/s2/favicons?domain=shopee.com&sz=128" className="w-5 h-5 rounded-md" alt="Shopee" /> },
                                  { label: "Lazada", key: "Lazada", icon: <img src="https://www.google.com/s2/favicons?domain=lazada.com&sz=128" className="w-5 h-5 rounded-md" alt="Lazada" /> },
                                  { label: "Google", key: "Google", icon: <Search className="text-blue-500 w-5 h-5" /> },
                                  { label: "Website Traffic", key: "Website", icon: <span className="text-xl leading-none">🌍</span> },
                                  { label: "Yandex", key: "Yandex", icon: <img src="https://www.google.com/s2/favicons?domain=yandex.com&sz=128" className="w-5 h-5 rounded-md" alt="Yandex" /> },
                                  { label: "Reverbnation", key: "Reverbnation", icon: <img src="https://www.google.com/s2/favicons?domain=reverbnation.com&sz=128" className="w-5 h-5 rounded-md" alt="Reverbnation" /> },
                               ];
                           } else {
                               buttonsToRender = [
                                  { label: "Facebook", key: "Facebook", icon: <Facebook className="text-[#1877F2] w-5 h-5" /> },
                                  { label: "Instagram", key: "Instagram", icon: <Instagram className="text-pink-500 w-5 h-5" /> },
                                  { label: "TikTok", key: "Tiktok", icon: <span className="text-xl leading-none">🎵</span> },
                                  { label: "YouTube", key: "Youtube", icon: <Youtube className="text-red-500 w-5 h-5" /> },
                                  { label: "X (Twitter)", key: "Twitter", icon: <span className="text-gray-900 font-bold text-lg leading-none">X</span> },
                                  { label: "Telegram", key: "Telegram", icon: <Send className="text-[#2AABEE] w-5 h-5" /> },
                                  { label: "WhatsApp", key: "Whatsapp", icon: <MessageCircle className="text-green-500 w-5 h-5" /> },
                                  { label: "Threads", key: "Threads", icon: <span className="text-gray-900 font-bold text-lg leading-none">@</span> },
                                  { label: "Snapchat", key: "Snapchat", icon: <span className="text-xl leading-none">👻</span> },
                                  { label: "Pinterest", key: "Pinterest", icon: <span className="text-xl leading-none">📌</span> },
                                  { label: "LinkedIn", key: "Linkedin", icon: <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" className="w-5 h-5 rounded-md" alt="LinkedIn" /> },
                                  { label: "Discord", key: "Discord", icon: <span className="text-[#5865F2] font-bold text-xl leading-none">👾</span> },
                                  { label: "Reddit", key: "Reddit", icon: <span className="text-orange-500 font-bold text-xl leading-none">🤖</span> },
                                  { label: "Tumblr", key: "Tumblr", icon: <span className="text-indigo-800 font-bold text-xl leading-none">t</span> },
                                  { label: "Quora", key: "Quora", icon: <span className="text-red-700 font-bold text-lg leading-none">Q</span> },
                               ];
                           }
                           
                           return buttonsToRender.map(btn => (
                               <SocialBtn 
                                  key={btn.key} 
                                  icon={btn.icon} 
                                  label={btn.label} 
                                  onClick={() => handleSocialFilter(btn.key)} 
                                  active={searchCategory.toLowerCase() === btn.key.toLowerCase()} 
                               />
                           ));
                        })()}
                      </div>
                  </div>
               </div>

               {/* Order Form Card */}
               <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="p-4 sm:p-6 space-y-5">
                      <div className="flex gap-2 mb-2">
                         <button className="flex-1 bg-[#2AABEE] text-white py-2.5 rounded-full font-medium text-[15px] shadow-sm">
                            New Order
                         </button>
                      </div>

                      <div>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                               <Search className="h-5 w-5 text-gray-800 stroke-[2.5]" />
                            </div>
                            <input
                              type="text"
                              value={searchCategory}
                              onChange={(e) => setSearchCategory(e.target.value)}
                              placeholder={t.search}
                              className="w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl pl-11 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                            />
                         </div>
                      </div>

                      <div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">{t.category}</label>
                         <div 
                            className={`w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium ${services.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex justify-between items-center`}
                            onClick={() => {
                               if (services.length > 0) {
                                  setShowCategoryDropdown(!showCategoryDropdown);
                                  setShowServiceDropdown(false);
                               }
                            }}
                         >
                            <div className="truncate text-sm pr-4 flex items-center gap-2">
                               {services.length === 0 ? (
                                   <div className="flex items-center gap-2 text-gray-500 font-normal">
                                      <Loader2 className="w-4 h-4 animate-spin" /> {t.loadingServices}
                                   </div>
                               ) : selectedCategory ? (
                                   <>
                                       {getCategoryIcon(selectedCategory)}
                                       <span className="truncate leading-snug">{selectedCategory}</span>
                                   </>
                               ) : t.selectCategory}
                            </div>
                            <svg className={`shrink-0 w-4 h-4 text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showCategoryDropdown && services.length > 0 && (
                             <div className="absolute z-40 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-[350px] overflow-y-auto">
                                 {filteredCategories.length > 0 ? filteredCategories.map(c => (
                                     <div 
                                        key={c} 
                                        onClick={() => {
                                            setSelectedCategory(c);
                                            setShowCategoryDropdown(false);
                                        }}
                                        className={`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-[#ffffff] flex items-center gap-3 transition ${selectedCategory === c ? 'bg-[#f0f0f0]' : ''}`}
                                     >
                                         {getCategoryIcon(c)}
                                         <span className="text-sm font-medium text-gray-800 leading-snug">{c}</span>
                                     </div>
                                 )) : (
                                     <div className="p-4 text-sm text-gray-500 text-center">{t.noCategories}</div>
                                 )}
                             </div>
                         )}
                      </div>

                      <div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">{t.service}</label>
                         <div 
                            className={`w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium ${services.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex justify-between items-center`}
                            onClick={() => {
                                if (services.length > 0) {
                                    setShowServiceDropdown(!showServiceDropdown)
                                }
                            }}
                         >
                            <div className="truncate text-sm pr-4">
                               {services.length === 0 ? (
                                   <span className="text-gray-500 font-normal">{t.loadingServices}</span>
                               ) : selectedService ? (
                                   <span className="flex items-center gap-2 truncate">
                                       <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">{selectedService.service}</span>
                                       <span className="truncate">- {selectedService.name} [ {formatSmmCurrency(parseFloat(selectedService.rate))} per {isGameCategory(selectedService.category) ? '1' : '1000'} ]</span>
                                   </span>
                               ) : t.selectService}
                            </div>
                            <svg className={`shrink-0 w-4 h-4 text-gray-500 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showServiceDropdown && (
                             <div className="absolute z-40 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                                 {currentServices.map((s, idx) => (
                                     <div 
                                        key={`${s.service}-${idx}`} 
                                        onClick={() => {
                                            setSelectedService(s);
                                            setShowServiceDropdown(false);
                                        }}
                                        className={`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-[#ffffff] flex flex-col gap-1 transition ${selectedService?.service === s.service ? 'bg-[#f0f0f0]' : ''}`}
                                     >
                                         <div className="flex items-start gap-2">
                                             <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 shrink-0">{s.service}</span>
                                             <span className="text-sm font-medium text-gray-800 leading-snug">{s.name} - {formatSmmCurrency(parseFloat(s.rate))} per {isGameCategory(s.category) ? '1' : '1000'}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">{t.link}</label>
                          <input 
                             type="text" 
                             value={link}
                             onChange={(e) => { setLink(e.target.value); setErrors(p => ({...p, link: undefined})); }}
                              className={`w-full bg-[#ffffff] border ${errors.link ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400`}
                           />
                           {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">{t.quantity}</label>
                          <input 
                             type="number"
                             value={quantity}
                             onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({...p, quantity: undefined})); }}
                              className={`w-full bg-[#ffffff] border ${errors.quantity ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400`}
                           />
                           {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                          <div className="text-gray-700 text-sm mt-3 font-medium pl-1">
                             {t.minMax.replace("Min", selectedService?.min || "50").replace("Max", selectedService?.max || "500000")}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">{t.charge}</label>
                          <input 
                             type="text"
                             value={formatSmmCurrency(Number(charge))}
                             readOnly
                             className="w-full bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-500 font-medium outline-none cursor-not-allowed"
                           />
                      </div>

                      <div className="pt-2">
                        <button 
                             onClick={handlePlaceOrder}
                             className="w-full bg-[#2AABEE] hover:bg-[#1e99d8] text-white py-3.5 rounded-[14px] font-medium text-[16px] shadow-sm transition active:scale-[0.98]"
                          >
                             {t.submit}
                        </button>
                      </div>
                  </div>
               </div>
               
               {/* Service Details Card */}
               {selectedService && (
                   <div className="bg-[#f0f9ff] border border-blue-100 rounded-[20px] shadow-sm overflow-hidden mt-6">
                       <div className="bg-[#f0f9ff] p-4 border-b border-blue-100">
                           <h3 className="font-bold text-gray-900">{t.serviceDetails}</h3>
                       </div>
                       <div className="bg-white p-5 space-y-4">
                           <div className="flex justify-between border-b border-gray-100 pb-3 border-dashed">
                               <span className="font-bold text-gray-800 text-sm">{t.charge}</span>
                               <span className="text-blue-600 font-medium">{formatSmmCurrency(Number(charge))}</span>
                           </div>
                           <div className="flex items-center justify-between border-b border-gray-100 pb-3 border-dashed">
                               <span className="font-bold text-gray-800 text-sm">{t.category}</span>
                               <span className="text-gray-600 font-medium text-xs bg-gray-100 py-1 px-2 rounded-lg">{selectedService.category}</span>
                           </div>
                           {(selectedService.desc || selectedService.description) && (
                               <div className="pt-2">
                                  <span className="font-bold text-gray-800 text-sm block mb-2">{t.description}</span>
                                  <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed description-container custom-scrollbar max-h-[300px] overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: selectedService.desc || selectedService.description }} />
                               </div>
                           )}
                       </div>
                   </div>
               )}
            </div>
         )}

         {activeTab === "services" && (
            <div className="max-w-5xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.services}</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-[#ffffff] border-b border-[#e2e8f0] font-bold text-gray-700">
                           <tr>
                              <th className="px-4 py-4">ID</th>
                              <th className="px-4 py-4">{t.service}</th>
                              <th className="px-4 py-4 whitespace-nowrap">{t.ratePer1000}</th>
                              <th className="px-4 py-4 text-right">{t.minMax}</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                           {services.map((s, idx) => (
                              <tr key={`${s.service}-${idx}`} className="hover:bg-[#ffffff] transition-colors">
                                 <td className="px-4 py-3.5"><span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">{s.service}</span></td>
                                 <td className="px-4 py-3.5 font-medium text-gray-700">{s.name}</td>
                                 <td className="px-4 py-3.5 font-mono text-[#2AABEE] font-bold">${s.rate}</td>
                                 <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-right">{s.min} / {s.max}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === "orders" && (
            <div className="max-w-5xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t.myOrders}</h2>
                  <span className="bg-[#2AABEE]/10 text-[#2AABEE] text-xs font-bold px-3 py-1 rounded-full border border-[#2AABEE]/20">
                     {userOrders.length} {userOrders.length === 1 ? "Order" : "Orders"}
                  </span>
               </div>

               {ordersLoading ? (
                  <div className="bg-white rounded-2xl p-12 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
                     <Loader2 className="w-8 h-8 text-[#2AABEE] animate-spin mb-3" />
                     <p className="text-gray-500 text-sm font-medium">{t.loadingOrders}</p>
                  </div>
               ) : userOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <ShoppingCart className="w-8 h-8 text-gray-300 font-normal" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-700 mb-1">{t.noOrdersYet}</h3>
                     <p className="text-gray-500 max-w-sm text-sm">{t.noOrdersSub}</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {userOrders.map((order) => {
                        const statusLower = (order.status || "pending").toLowerCase();
                        let statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-100";
                        let statusText = order.status || "Pending";
                        
                        if (statusLower === "completed" || statusLower === "success") {
                           statusBadgeClass = "bg-green-50 text-green-700 border-green-100";
                           statusText = "Completed ✅";
                        } else if (statusLower === "processing" || statusLower === "in progress" || statusLower === "inprogress") {
                           statusBadgeClass = "bg-blue-50 text-blue-700 border-blue-100 animate-pulse";
                           statusText = statusLower === "processing" ? "Processing ⚙️" : "In Progress 🚀";
                        } else if (statusLower === "partial") {
                           statusBadgeClass = "bg-purple-50 text-purple-700 border-purple-100";
                           statusText = "Partial ⚠️";
                        } else if (statusLower === "canceled" || statusLower === "cancelled" || statusLower === "failed" || statusLower === "rejected") {
                           statusBadgeClass = "bg-red-50 text-red-700 border-red-100";
                           statusText = statusLower === "failed" ? "Failed ❌" : "Canceled ❌";
                        }

                        return (
                           <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                              <div className="space-y-4">
                                 {/* Header: Date & Status */}
                                 <div className="flex justify-between items-start gap-2">
                                    <span className="text-xs font-mono text-gray-400">
                                       {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date N/A"}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                                       {statusText}
                                    </span>
                                 </div>

                                 {/* Service Name */}
                                 <div>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                                       {order.category || "Social Service"}
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-800 mt-1.5 leading-snug">
                                       {order.serviceName || `Service ID: ${order.serviceId}`}
                                    </h4>
                                 </div>

                                 {/* Link */}
                                 <div className="bg-gray-50/50 rounded-lg p-2.5 border border-gray-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t.targetUrl}</span>
                                    <a 
                                       href={order.link} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="text-xs text-[#2AABEE] hover:underline font-medium break-all"
                                    >
                                       {order.link}
                                    </a>
                                 </div>
                              </div>

                              {/* Footer details: Quantity & Total Cost */}
                              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                 <div className="grid grid-cols-2 gap-x-6">
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase block">{t.quantity}</span>
                                       <span className="text-sm font-bold text-gray-700">{order.quantity ? order.quantity.toLocaleString() : "0"}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase block">{t.amountPaid}</span>
                                       <span className="text-sm font-black text-[#2AABEE]">{formatSmmCurrency(Number(order.amountUSD || 0))}</span>
                                    </div>
                                 </div>

                                 {order.providerOrderId && (
                                    <div className="text-right">
                                       <span className="text-[9px] text-gray-400 font-semibold block uppercase">{t.orderId}</span>
                                       <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                          #{order.providerOrderId}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}
         
      </div>
    </motion.div>
  );
}

function SocialBtn({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {
   return (
      <button 
         onClick={onClick}
         className={`${active ? 'bg-gray-800 ring-2 ring-[#2AABEE]' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-lg py-2.5 px-3 flex items-center gap-3 transition shadow-sm border-b-2 border-transparent hover:border-black overflow-hidden`}
      >
         <div className="bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center shadow-sm">
            {icon}
         </div>
         <span className="font-medium text-[15px] truncate text-left">{label}</span>
      </button>
   );
}

