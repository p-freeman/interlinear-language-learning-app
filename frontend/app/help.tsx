import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../src/contexts/SettingsContext';
import { SupportedLanguage } from '../src/i18n/translations';

interface HelpContent {
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
}

const helpContent: Record<SupportedLanguage, HelpContent> = {
  en: {
    title: 'Help & User Guide',
    sections: [
      {
        title: 'What is this app?',
        content: 'The Interlinear Language Learning App helps you learn German and Swiss German using the Birkenbihl method. This method involves three steps:\n\n1. Decoding - Reading word-by-word translations\n2. Active Listening - Listening while reading\n3. Passive Listening - Background audio repetition',
      },
      {
        title: 'Getting Started',
        content: 'To start learning:\n\n1. Tap the + button on the home screen\n2. Either import a content package (ZIP file) or create your own project\n3. Open a project and use "Interlinear View" to read while listening\n4. Use "Audio Loop" for passive listening practice',
      },
      {
        title: 'Creating a Project',
        content: 'To create your own project:\n\n1. Tap "Create New Project" on the import screen\n2. Enter the project name and select languages\n3. Choose an audio file (MP3) - this is optional\n4. Choose an interlinear HTML file - this is required\n5. Tap "Create Project"',
      },
      {
        title: 'Importing Content',
        content: 'You can import content packages in ZIP format. A valid ZIP should contain:\n\n• audio.mp3 - The audio file\n• interlinear.html - The word-by-word translation text\n• project.yaml - Project metadata (optional)\n\nYou can import from your device or from a URL.',
      },
      {
        title: 'Interlinear View',
        content: 'In the interlinear view:\n\n• Use + and - buttons to zoom text\n• Use the audio player to play, pause, and seek\n• The audio player shows current position and total duration\n• Text and audio work together for active learning',
      },
      {
        title: 'Audio Loop Mode',
        content: 'Audio Loop mode is for passive listening:\n\n• Audio plays continuously in a loop\n• Great for background listening while doing other tasks\n• The counter shows how many times the audio has looped\n• Helps with language absorption through repetition',
      },
      {
        title: 'Settings',
        content: 'Access settings via the gear icon:\n\n• Change app language\n• Adjust playback speed (0.5x to 2x)\n• Set auto-repeat count for loops\n• Change font size for interlinear text\n• Enable/disable study statistics tracking\n• Export your learning data',
      },
      {
        title: 'Study Statistics',
        content: 'The app tracks your learning progress:\n\n• Active reading time (interlinear view)\n• Passive listening time (audio loop)\n• Total study sessions\n• You can export statistics as a text file',
      },
    ],
  },
  fr: {
    title: 'Aide et Guide d\'utilisation',
    sections: [
      {
        title: 'Qu\'est-ce que cette application?',
        content: 'L\'application Interlinear aide à apprendre l\'allemand et le suisse allemand avec la méthode Birkenbihl. Cette méthode comprend trois étapes:\n\n1. Décodage - Lecture des traductions mot à mot\n2. Écoute active - Écouter en lisant\n3. Écoute passive - Répétition audio en arrière-plan',
      },
      {
        title: 'Pour commencer',
        content: 'Pour commencer à apprendre:\n\n1. Appuyez sur le bouton + sur l\'écran d\'accueil\n2. Importez un paquet de contenu (fichier ZIP) ou créez votre propre projet\n3. Ouvrez un projet et utilisez "Vue interlinéaire" pour lire en écoutant\n4. Utilisez "Boucle audio" pour l\'écoute passive',
      },
      {
        title: 'Créer un projet',
        content: 'Pour créer votre propre projet:\n\n1. Appuyez sur "Créer un nouveau projet"\n2. Entrez le nom du projet et sélectionnez les langues\n3. Choisissez un fichier audio (MP3) - optionnel\n4. Choisissez un fichier HTML interlinéaire - requis\n5. Appuyez sur "Créer le projet"',
      },
      {
        title: 'Importer du contenu',
        content: 'Vous pouvez importer des paquets de contenu en format ZIP. Un ZIP valide doit contenir:\n\n• audio.mp3 - Le fichier audio\n• interlinear.html - Le texte de traduction mot à mot\n• project.yaml - Métadonnées du projet (optionnel)',
      },
      {
        title: 'Paramètres',
        content: 'Accédez aux paramètres via l\'icône d\'engrenage:\n\n• Changer la langue de l\'application\n• Ajuster la vitesse de lecture\n• Définir le nombre de répétitions\n• Changer la taille de police\n• Activer/désactiver le suivi des statistiques',
      },
    ],
  },
  it: {
    title: 'Aiuto e Guida Utente',
    sections: [
      {
        title: 'Cos\'è questa app?',
        content: 'L\'app Interlinear ti aiuta a imparare tedesco e svizzero tedesco con il metodo Birkenbihl. Questo metodo prevede tre passaggi:\n\n1. Decodifica - Lettura delle traduzioni parola per parola\n2. Ascolto attivo - Ascoltare mentre leggi\n3. Ascolto passivo - Ripetizione audio in sottofondo',
      },
      {
        title: 'Per iniziare',
        content: 'Per iniziare ad imparare:\n\n1. Tocca il pulsante + nella schermata iniziale\n2. Importa un pacchetto di contenuti (file ZIP) o crea il tuo progetto\n3. Apri un progetto e usa "Vista interlineare" per leggere ascoltando\n4. Usa "Loop audio" per l\'ascolto passivo',
      },
      {
        title: 'Creare un progetto',
        content: 'Per creare il tuo progetto:\n\n1. Tocca "Crea nuovo progetto"\n2. Inserisci il nome del progetto e seleziona le lingue\n3. Scegli un file audio (MP3) - opzionale\n4. Scegli un file HTML interlineare - richiesto\n5. Tocca "Crea progetto"',
      },
      {
        title: 'Impostazioni',
        content: 'Accedi alle impostazioni tramite l\'icona dell\'ingranaggio:\n\n• Cambia lingua dell\'app\n• Regola velocità di riproduzione\n• Imposta numero di ripetizioni\n• Cambia dimensione carattere\n• Abilita/disabilita statistiche di studio',
      },
    ],
  },
  es: {
    title: 'Ayuda y Guía del Usuario',
    sections: [
      {
        title: '¿Qué es esta aplicación?',
        content: 'La aplicación Interlinear te ayuda a aprender alemán y alemán suizo con el método Birkenbihl. Este método incluye tres pasos:\n\n1. Decodificación - Lectura de traducciones palabra por palabra\n2. Escucha activa - Escuchar mientras lees\n3. Escucha pasiva - Repetición de audio en segundo plano',
      },
      {
        title: 'Para empezar',
        content: 'Para empezar a aprender:\n\n1. Toca el botón + en la pantalla de inicio\n2. Importa un paquete de contenido (archivo ZIP) o crea tu propio proyecto\n3. Abre un proyecto y usa "Vista interlineal" para leer mientras escuchas\n4. Usa "Bucle de audio" para escucha pasiva',
      },
      {
        title: 'Crear un proyecto',
        content: 'Para crear tu propio proyecto:\n\n1. Toca "Crear nuevo proyecto"\n2. Ingresa el nombre del proyecto y selecciona los idiomas\n3. Elige un archivo de audio (MP3) - opcional\n4. Elige un archivo HTML interlineal - requerido\n5. Toca "Crear proyecto"',
      },
      {
        title: 'Configuración',
        content: 'Accede a la configuración mediante el icono de engranaje:\n\n• Cambiar idioma de la app\n• Ajustar velocidad de reproducción\n• Establecer número de repeticiones\n• Cambiar tamaño de fuente\n• Activar/desactivar estadísticas de estudio',
      },
    ],
  },
  pt: {
    title: 'Ajuda e Guia do Usuário',
    sections: [
      {
        title: 'O que é este aplicativo?',
        content: 'O aplicativo Interlinear ajuda você a aprender alemão e alemão suíço com o método Birkenbihl. Este método inclui três etapas:\n\n1. Decodificação - Leitura de traduções palavra por palavra\n2. Escuta ativa - Ouvir enquanto lê\n3. Escuta passiva - Repetição de áudio em segundo plano',
      },
      {
        title: 'Para começar',
        content: 'Para começar a aprender:\n\n1. Toque no botão + na tela inicial\n2. Importe um pacote de conteúdo (arquivo ZIP) ou crie seu próprio projeto\n3. Abra um projeto e use "Vista interlinear" para ler enquanto ouve\n4. Use "Loop de áudio" para escuta passiva',
      },
      {
        title: 'Criar um projeto',
        content: 'Para criar seu próprio projeto:\n\n1. Toque em "Criar novo projeto"\n2. Digite o nome do projeto e selecione os idiomas\n3. Escolha um arquivo de áudio (MP3) - opcional\n4. Escolha um arquivo HTML interlinear - obrigatório\n5. Toque em "Criar projeto"',
      },
      {
        title: 'Configurações',
        content: 'Acesse as configurações através do ícone de engrenagem:\n\n• Mudar idioma do app\n• Ajustar velocidade de reprodução\n• Definir número de repetições\n• Mudar tamanho da fonte\n• Ativar/desativar estatísticas de estudo',
      },
    ],
  },
  ru: {
    title: 'Помощь и Руководство',
    sections: [
      {
        title: 'Что это за приложение?',
        content: 'Приложение Interlinear помогает изучать немецкий и швейцарский немецкий по методу Биркенбиль. Этот метод включает три этапа:\n\n1. Декодирование - Чтение пословного перевода\n2. Активное слушание - Слушать читая\n3. Пассивное слушание - Фоновое повторение аудио',
      },
      {
        title: 'Начало работы',
        content: 'Чтобы начать обучение:\n\n1. Нажмите кнопку + на главном экране\n2. Импортируйте пакет контента (ZIP) или создайте свой проект\n3. Откройте проект и используйте "Подстрочный вид" для чтения со слушанием\n4. Используйте "Аудио цикл" для пассивного слушания',
      },
      {
        title: 'Создание проекта',
        content: 'Чтобы создать свой проект:\n\n1. Нажмите "Создать новый проект"\n2. Введите название и выберите языки\n3. Выберите аудиофайл (MP3) - опционально\n4. Выберите HTML файл с подстрочником - обязательно\n5. Нажмите "Создать проект"',
      },
      {
        title: 'Настройки',
        content: 'Доступ к настройкам через значок шестерёнки:\n\n• Изменить язык приложения\n• Настроить скорость воспроизведения\n• Установить количество повторов\n• Изменить размер шрифта\n• Включить/выключить статистику обучения',
      },
    ],
  },
  uk: {
    title: 'Допомога та Посібник',
    sections: [
      {
        title: 'Що це за додаток?',
        content: 'Додаток Interlinear допомагає вивчати німецьку та швейцарську німецьку за методом Біркенбіль. Цей метод включає три етапи:\n\n1. Декодування - Читання послівного перекладу\n2. Активне слухання - Слухати читаючи\n3. Пасивне слухання - Фонове повторення аудіо',
      },
      {
        title: 'Початок роботи',
        content: 'Щоб почати навчання:\n\n1. Натисніть кнопку + на головному екрані\n2. Імпортуйте пакет контенту (ZIP) або створіть свій проект\n3. Відкрийте проект і використовуйте "Підрядковий вид" для читання зі слуханням\n4. Використовуйте "Аудіо цикл" для пасивного слухання',
      },
      {
        title: 'Створення проекту',
        content: 'Щоб створити свій проект:\n\n1. Натисніть "Створити новий проект"\n2. Введіть назву та виберіть мови\n3. Виберіть аудіофайл (MP3) - опціонально\n4. Виберіть HTML файл з підрядником - обов\'язково\n5. Натисніть "Створити проект"',
      },
      {
        title: 'Налаштування',
        content: 'Доступ до налаштувань через значок шестірні:\n\n• Змінити мову додатку\n• Налаштувати швидкість відтворення\n• Встановити кількість повторів\n• Змінити розмір шрифту\n• Увімкнути/вимкнути статистику навчання',
      },
    ],
  },
  tr: {
    title: 'Yardım ve Kullanım Kılavuzu',
    sections: [
      {
        title: 'Bu uygulama nedir?',
        content: 'Interlinear uygulaması Birkenbihl yöntemiyle Almanca ve İsviçre Almancası öğrenmenize yardımcı olur. Bu yöntem üç adım içerir:\n\n1. Kod çözme - Kelime kelime çevirileri okuma\n2. Aktif dinleme - Okurken dinleme\n3. Pasif dinleme - Arka planda ses tekrarı',
      },
      {
        title: 'Başlarken',
        content: 'Öğrenmeye başlamak için:\n\n1. Ana ekranda + düğmesine dokunun\n2. Bir içerik paketi (ZIP) içe aktarın veya kendi projenizi oluşturun\n3. Bir proje açın ve dinlerken okumak için "Satır arası görünüm"ü kullanın\n4. Pasif dinleme için "Ses döngüsü"nü kullanın',
      },
      {
        title: 'Proje oluşturma',
        content: 'Kendi projenizi oluşturmak için:\n\n1. "Yeni proje oluştur"a dokunun\n2. Proje adını girin ve dilleri seçin\n3. Bir ses dosyası (MP3) seçin - isteğe bağlı\n4. Bir satır arası HTML dosyası seçin - gerekli\n5. "Proje oluştur"a dokunun',
      },
      {
        title: 'Ayarlar',
        content: 'Dişli simgesi aracılığıyla ayarlara erişin:\n\n• Uygulama dilini değiştirin\n• Oynatma hızını ayarlayın\n• Tekrar sayısını belirleyin\n• Yazı boyutunu değiştirin\n• Çalışma istatistiklerini etkinleştirin/devre dışı bırakın',
      },
    ],
  },
  ku: {
    title: 'Alîkarî û Rêbernameya Bikarhêner',
    sections: [
      {
        title: 'Ev sepan çi ye?',
        content: 'Sepana Interlinear bi rêbaza Birkenbihl alîkariya te dike ku tu Almanî û Almaniya Swîsreyê fêr bibî. Ev rêbaz sê gavan vedihewîne:\n\n1. Dekodkirin - Xwendina wergerên peyv bi peyv\n2. Guhdarîkirina çalak - Guhdarîkirin dema xwendinê\n3. Guhdarîkirina pasîf - Dubarebûna dengê paşîn',
      },
      {
        title: 'Destpêkirin',
        content: 'Ji bo destpêkirina fêrbûnê:\n\n1. Li ser ekrana sereke bişkoja + bitikîne\n2. Pakêta naverokê (ZIP) hawirde bike an projeya xwe çêke\n3. Projeyek veke û "Dîtina navxetî" bikar bîne\n4. Ji bo guhdarîkirina pasîf "Çerxa deng" bikar bîne',
      },
      {
        title: 'Çêkirina projeyê',
        content: 'Ji bo çêkirina projeya xwe:\n\n1. "Projeya nû çêke" bitikîne\n2. Navê projeyê binivîse û zimanan hilbijêre\n3. Pelê deng (MP3) hilbijêre - vebijarkî\n4. Pelê HTML yê navxetî hilbijêre - pêwîst\n5. "Proje çêke" bitikîne',
      },
      {
        title: 'Mîheng',
        content: 'Bi îkona çerxê bigihîje mîhengan:\n\n• Zimanê sepanê biguherîne\n• Leza lêxistinê eyar bike\n• Hejmara dubarekirinê destnîşan bike\n• Mezinahiya tîpan biguherîne\n• Amarkên xwendinê çalak/neçalak bike',
      },
    ],
  },
};

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const content = helpContent[settings.appLanguage] || helpContent.en;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="help-circle" size={60} color="#6c5ce7" />
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>
            Interlinear Language Learning App
          </Text>
        </View>

        {content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chevron-forward-circle" size={20} color="#6c5ce7" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This app was created to help people learn languages using the Birkenbihl method.
          </Text>
          <Text style={styles.footerNote}>
            App created with AI assistance (Emergent AI / Claude)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#a0a0c0',
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    color: '#a0a0c0',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#a0a0c0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerNote: {
    color: '#4a4a6a',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
