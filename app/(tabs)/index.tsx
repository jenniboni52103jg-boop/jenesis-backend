import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    OAuthProvider,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { auth, db } from "../../firebase";
import { LanguageContext } from "../context/LanguageContext";
import { useCredits } from "../contexts/CreditsContext";

/* ===== IMMAGINI HERO PUBBLICITÀ ===== */
const HERO_IMAGES = [
  require("../../assets/hero/hero1.png"),
  require("../../assets/hero/hero2.png"),
  require("../../assets/hero/hero3.png"),
  require("../../assets/hero/hero4.png"),
];

/* ===== CATEGORIE + IMMAGINI ===== */
const CATEGORIES: Record<string, any[]> = {
  autunno: [
    require("../../assets/autunno/autunno1.jpeg"),
    require("../../assets/autunno/autunno2.jpeg"),
    require("../../assets/autunno/autunno3.jpeg"),
    require("../../assets/autunno/autunno4.jpeg"),
  ],
  calcio: [
    require("../../assets/calcio/calcio1.jpeg"),
    require("../../assets/calcio/calcio2.jpeg"),
    require("../../assets/calcio/calcio3.jpeg"),
    require("../../assets/calcio/calcio4.jpeg"),
  ],
  photoshop: [
    require("../../assets/photoshop/photoshop1.jpeg"),
    require("../../assets/photoshop/photoshop2.jpeg"),
    require("../../assets/photoshop/photoshop3.jpeg"),
    require("../../assets/photoshop/photoshop4.jpeg"),
  ],
  portraits: [
    require("../../assets/portraits/portraits1.jpeg"),
    require("../../assets/portraits/portraits2.jpeg"),
    require("../../assets/portraits/portraits3.jpeg"),
    require("../../assets/portraits/portraits4.jpeg"),
  ],
  travel: [
    require("../../assets/travel/travel1.jpeg"),
    require("../../assets/travel/travel2.jpeg"),
    require("../../assets/travel/travel3.jpeg"),
    require("../../assets/travel/travel4.jpeg"),
  ],
};

export default function HomeScreen() {
  /* crediti */
 const { credits } = useCredits();

  const router = useRouter();
  const { openModal } = useLocalSearchParams<{ openModal?: "privacy" | "terms" }>();

  /* ✅ PRIVACY / TERMS MODALS SEPARATI (NO MODAL DENTRO MODAL) */
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  /* MENU */
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // simulazione login (user mock)
  const [user, setUser] = useState<null | { email: string; provider: string }>(
    null
  );

  /* USER / MOCK */
  const { language, setLanguage } = useContext(LanguageContext);
  console.log("LANG CURRENT", language)

  /* STATI PER IL LOGIN */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* SUPPORT */
  const [supportMessage, setSupportMessage] = useState("");

  const [_request, _response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "205077231736-nnmdc3it0kke6t11ti3cjv26svc3g6us.apps.googleusercontent.com",
    androidClientId:
      "205077231736-qdka4upgdfk6ca3jrj53at2f0bl9vk3s.apps.googleusercontent.com",
  });

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser({ email: userCredential.user.email ?? "", provider: "email" });
      setActiveMenu(null);
      setIsSignUpModalVisible(false);
    } catch (error: any) {
      alert("Errore: " + error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser({ email: userCredential.user.email ?? "", provider: "email" });
      alert("Account creato con successo!");
      setActiveMenu(null);
      setIsSignUpModalVisible(false);
    } catch (error: any) {
      alert("Errore Registrazione: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === "success") {
        const { id_token } = result.params as any;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
        setIsSignUpModalVisible(false);
        setActiveMenu(null);
      }
    } catch (error: any) {
      alert("Errore Google: " + error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      if (identityToken) {
        const provider = new OAuthProvider("apple.com");
        const authCredential = provider.credential({ idToken: identityToken });
        await signInWithCredential(auth, authCredential);
        setIsSignUpModalVisible(false);
        setActiveMenu(null);
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        alert("Errore Apple: " + e.message);
      }
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      alert("Login Microsoft in fase di attivazione su Azure!");
    } catch (error: any) {
      alert("Errore Microsoft: " + error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

 const handleLogout = async () => {
  if (!auth.currentUser) {
    alert("Nessun utente loggato.");
    return;
  }

  Alert.alert(
    "Logout",
    "Sei sicura di voler uscire?",
    [
      { text: "Annulla", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            setUser(null);
            setMenuOpen(false);
            alert("Logout effettuato ✅");
          } catch (error: any) {
            alert("Errore logout: " + error.message);
          }
        },
      },
    ]
  );
};
  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;

    try {
      await addDoc(collection(db, "supportMessages"), {
        userEmail: user?.email || "anonymous",
        message: supportMessage,
        createdAt: serverTimestamp(),
        status: "open",
      });

      alert("Messaggio inviato ✅");
      setSupportMessage("");
      setActiveMenu(null);
    } catch (error) {
      alert("Errore invio messaggio");
    }
  };

  const changeLanguage = (lang: string) => {
  setLanguage(lang); // usa il provider globale
  setActiveMenu(null);
};

const params = useLocalSearchParams();

useEffect(() => {
  if (params?.openLogin === "1") {
    setMenuOpen(true);              // apre il drawer/menu
    setActiveMenu("My account");    // apre la tua schermata login nel menu
  }
}, [params?.openLogin]);

useEffect(() => {
  if (openModal === "privacy") {
    setPrivacyOpen(true);
    setTermsOpen(false);
    router.setParams({ openModal: undefined }); // pulisce il parametro
  }

  if (openModal === "terms") {
    setTermsOpen(true);
    setPrivacyOpen(false);
    router.setParams({ openModal: undefined }); // pulisce il parametro
  }
}, [openModal]);

  /* HERO TEXT */
  const heroMessages = [
    "Crea video virali per TikTok e Reels in 30 secondi",
    "Crea Foto AI insieme al tuo idolo ⚽️",
    "Scatta, anima, pubblica. Diventa virale 🚀",
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  /* HERO PUBBLICITÀ */
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroFade = useRef(new Animated.Value(1)).current;

  /* IMMAGINI TREND */
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const heroTextTimer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMessages.length);
    }, 3500);

    const trendTimer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % 4);
    }, 2500);

    const heroImageTimer = setInterval(() => {
      Animated.sequence([
        Animated.timing(heroFade, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heroFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => {
      clearInterval(heroTextTimer);
      clearInterval(trendTimer);
      clearInterval(heroImageTimer);
    };
  }, [heroFade]);

  return (
    <LinearGradient
      colors={["#0B0F2F", "#1B1464", "#2E2A8A"]}
      style={styles.container}
    >
      {/* MENU DRAWER */}
      {menuOpen && (
        <View style={styles.drawer}>
          {/* CREDITS DETAILS — SOLO VISUALIZZAZIONE */}
          <View style={styles.drawerItemDisabled}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
               <Text style={{ color: "#fff", fontSize: 14 }}>
                 Credits                                       {credits} 🔥
              </Text>
             </View>
            </View>
          </View>

          {/* ALTRE VOCI */}
          {[
            "My account",
            "Messages",
            "Customer Service",
            "Language",
            "View Privacy Policy",
            "View Terms of Service",
            "Logout"
          ].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.drawerItem}
              
              onPress={() => {
  if (item === "View Privacy Policy") {
    setTermsOpen(false);
    setPrivacyOpen(true);
    setMenuOpen(false);
    return;
  }

  if (item === "View Terms of Service") {
    setPrivacyOpen(false);
    setTermsOpen(true);
    setMenuOpen(false);
    return;
  }

  // qui sotto restano le altre voci menu
  setActiveMenu(item);
  setMenuOpen(false);
}}
            >
             <Text
             style={[
             styles.drawerText,
             item === "Logout" && { color: "#FF3B30", fontWeight: "700" },
             ]}
            >
             {item}
      </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ✅ PRIVACY MODAL SEPARATO */}
      <Modal
        visible={privacyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}>
          <TouchableOpacity
            onPress={() => setPrivacyOpen(false)}
            style={{ position: "absolute", top: 50, right: 25, zIndex: 10 }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={{ color: "#a855f7", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 120,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator
          >
            <Text style={{ color: "#fff", fontSize: 13, lineHeight: 22 }}>
              Privacy Policy – Jenesis AI{"\n\n"}
              Last updated: 15 February 2026{"\n\n"}
              Jenesis AI (“we”, “our”, “the App”) respects your privacy and is committed to protecting the personal data of its users.
              {"\n\n"}
              1. Company Information Jenesis AI is operated by yenifer Garcia Bonilla, natural person, based in Italy.{"\n"}
              For privacy-related inquiries, users may contact us via the Customer Support section within the App.
              {"\n\n"}
              2. Information We Collect{"\n"}
              We may collect the following types of information:
              {"\n"}- Account information (email address, login provider such as Apple or Google)
              {"\n"}- Usage data (features used, credits consumed, interaction logs)
              {"\n"}- Support messages voluntarily sent by the user
              {"\n"}- Device and technical information (app version, device type, operating system)
              {"\n\n"}
              We do not collect sensitive personal data such as payment card numbers or biometric data.
              {"\n\n"}
              3. Legal Basis for Processing (GDPR){"\n"}
              For users located in the European Economic Area (EEA), personal data is processed on the following legal bases:
              {"\n"}- Performance of a contract (to provide and operate the Jenesis AI service)
              {"\n"}- Legitimate interests (to improve service quality, security, and user experience)
              {"\n"}- User consent, where required by applicable law
              {"\n\n"}
              4. How We Use Your Information{"\n"}
              Your data is used strictly to:
              {"\n"}- Provide and operate the Jenesis AI service
              {"\n"}- Manage user accounts and credit balances
              {"\n"}- Improve app performance and user experience
              {"\n"}- Respond to customer support requests
              {"\n"}- Prevent fraud, abuse, or misuse of the service
              {"\n\n"}
              5. Payments{"\n"}
              All payments, subscriptions, and in-app purchases are processed securely via Apple App Store or Google Play Store.
              {"\n"}
              Jenesis AI does not store, process, or have access to users’ full payment details (such as credit card numbers).
              {"\n\n"}
              6. AI-Generated Content{"\n"}
              Jenesis AI uses artificial intelligence technologies to generate content.
              {"\n"}
              Generated results may not always be accurate and are provided “as is”.
              {"\n"}
              Users are solely responsible for how generated content is used, shared, or distributed.
              {"\n"}
              Jenesis AI is not liable for misuse of AI-generated materials.
              {"\n\n"}
              7. Data Sharing{"\n"}
              We do not sell, rent, or trade personal data.
              {"\n"}
              Data may be shared only with trusted service providers (e.g., authentication, hosting, analytics) strictly for operating and improving the service.
              {"\n\n"}
              8. Data Storage & Security{"\n"}
              We apply reasonable technical and organizational security measures to protect personal data.
              {"\n"}
              However, no digital service can guarantee 100% security.
              {"\n\n"}
              9. User Rights{"\n"}
              Users have the right to:
              {"\n"}- Access their personal data
              {"\n"}- Request correction or deletion
              {"\n"}- Withdraw consent at any time (where applicable)
              {"\n"}- Request account deletion
              {"\n"}
              Requests may be made via the Customer Support section inside the App.
              {"\n\n"}
              10. Children’s Privacy{"\n"}
              Jenesis AI is not intended for users under the age of 13.
              {"\n"}
              We do not knowingly collect personal data from children.
              {"\n\n"}
              11. Third-Party Authentication Services{"\n"}
              Jenesis AI allows users to sign in using third-party providers.
              {"\n"}
              By using these services, users acknowledge that their data is also subject to the respective Privacy Policies:
              {"\n"}- Google: https://policies.google.com/privacy
              {"\n"}- Apple: https://www.apple.com/legal/privacy/
              {"\n"}- Microsoft: https://privacy.microsoft.com/privacy
              {"\n\n"}
              12. Changes to This Policy{"\n"}
              We may update this Privacy Policy from time to time.
              {"\n"}
              Any changes will be reflected within the App with an updated revision date.{"\n"}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ✅ TERMS MODAL SEPARATO (IDENTICO ALLA PRIVACY) */}
      <Modal
        visible={termsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTermsOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}>
          <TouchableOpacity
            onPress={() => setTermsOpen(false)}
            style={{ position: "absolute", top: 50, right: 25, zIndex: 10 }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={{ color: "#a855f7", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 120,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator
          >
            <Text style={{ color: "#fff", fontSize: 13, lineHeight: 22 }}>
              Terms of Service – Jenesis AI{"\n\n"}
              Last updated: 15 February 2026{"\n\n"}
              These Terms of Service (“Terms”) govern your access to and use of the Jenesis AI mobile application (“Jenesis AI”, “we”, “our”, or “the App”).
              {"\n\n"}
              By downloading, accessing, or using the App, you agree to be bound by these Terms.
              {"\n\n"}
              If you do not agree, you must not use the App.
              {"\n\n"}
              1. Eligibility{"\n"}
              You must be at least 13 years old to use Jenesis AI.
              {"\n"}
              If you are under 18, you confirm that you have permission from a parent or legal guardian.
              {"\n\n"}
              2. Description of the Service{"\n"}
              Jenesis AI provides AI-powered tools for generating digital content (including images, videos, and other media).
              {"\n\n"}
              The service may include:
              {"\n"}- Free features
              {"\n"}- Paid subscriptions
              {"\n"}- In-app credit purchases
              {"\n"}- AI-generated content tools
              {"\n\n"}
              We reserve the right to modify, suspend, or discontinue any feature at any time.
              {"\n\n"}
              3. User Accounts{"\n"}
              To access certain features, you may need to create an account.
              {"\n\n"}
              You agree to:
              {"\n"}- Provide accurate information
              {"\n"}- Keep login credentials secure
              {"\n"}- Be responsible for activity under your account
              {"\n\n"}
              We may suspend or terminate accounts that violate these Terms.
              {"\n\n"}
              4. Subscriptions{"\n"}
              Jenesis AI may offer auto-renewable subscriptions (e.g., weekly, monthly, yearly).
              {"\n\n"}
              Billing
              {"\n"}- Subscriptions are billed via Apple App Store or Google Play Store.
              {"\n"}- Payment is charged to your App Store / Google Play account at confirmation of purchase.
              {"\n"}- Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period.
              {"\n\n"}
              Cancellation You can manage or cancel subscriptions in your App Store / Google Play account settings.
              {"\n\n"}
              We do not process subscription payments directly and do not control billing systems of Apple or Google.
              {"\n\n"}
              5. Credits (In-App Purchases){"\n"}
              Jenesis AI may offer credit packages for purchase.
              {"\n\n"}
              Credits:
              {"\n"}- May be used for premium AI features
              {"\n"}- Are non-transferable
              {"\n"}- Have no real-world monetary value
              {"\n"}- Are non-refundable unless required by law
              {"\n\n"}
              Unused credits may expire according to the terms shown at purchase.
              {"\n\n"}
              6. Acceptable Use{"\n"}
              You agree not to use Jenesis AI to:
              {"\n"}- Violate any laws or regulations
              {"\n"}- Generate illegal, harmful, or abusive content
              {"\n"}- Infringe intellectual property rights
              {"\n"}- Harass, threaten, or impersonate others
              {"\n"}- Generate misleading, fraudulent, or deceptive material
              {"\n\n"}
              We reserve the right to restrict or terminate access for violations.
              {"\n\n"}
              7. AI-Generated Content{"\n"}
              Jenesis AI uses artificial intelligence systems.
              {"\n\n"}
              You acknowledge that:
              {"\n"}- AI outputs may not be accurate.
              {"\n"}- Results are provided “as is”.
              {"\n"}- You are solely responsible for how generated content is used or distributed.
              {"\n\n"}
              Jenesis AI is not liable for misuse of AI-generated content.
              {"\n\n"}
              8. Intellectual Property{"\n"}
              The App, including design, branding, and software, is owned by yenifer Garcia Bonilla.
              {"\n\n"}
              Users retain ownership of content they create, subject to applicable laws.
              {"\n\n"}
              You grant Jenesis AI a limited right to process your content solely to provide the service.
              {"\n\n"}
              9. Limitation of Liability{"\n"}
              To the maximum extent permitted by law:
              {"\n\n"}
              Jenesis AI shall not be liable for:
              {"\n"}- Indirect or consequential damages
              {"\n"}- Loss of profits or data
              {"\n"}- Damages resulting from use or inability to use the service
              {"\n"}- User misuse of AI-generated content
              {"\n\n"}
              The service is provided “as is” without warranties of any kind.
              {"\n\n"}
              10. Account Termination{"\n"}
              We may suspend or terminate your account if:
              {"\n"}- You violate these Terms
              {"\n"}- You misuse the service
              {"\n"}- Required by law
              {"\n\n"}
              You may request account deletion at any time via Customer Support.
              {"\n\n"}
              11. Refund Policy{"\n"}
              Refunds for subscriptions or credit purchases are handled exclusively by Apple App Store or Google Play Store according to their respective policies.
              {"\n\n"}
              We do not directly issue refunds.
              {"\n\n"}
              12. Changes to the Terms{"\n"}
              We may update these Terms from time to time.
              {"\n\n"}
              Continued use of the App after updates constitutes acceptance of the revised Terms.
              {"\n\n"}
              13. Governing Law{"\n"}
              These Terms are governed by the laws of Italy.
              {"\n\n"}
              Any disputes shall be subject to the competent courts of Italy, unless otherwise required by consumer protection laws.{"\n"}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* MODALE unico (NO privacy/terms dentro) */}
      <Modal
        visible={!!activeMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveMenu(null)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={() => {}} accessible={false}>
        <View style={styles.modalCard}>
          <TouchableOpacity onPress={() => setActiveMenu(null)}>
            <Text style={{ color: "#aaa", textAlign: "right" }}>✕</Text>
          </TouchableOpacity>

          {activeMenu === "Customer Service" && (
            <>
              <Text style={styles.modalText}>
                Welcome to Jenesis AI Customer Support! How can I assist you today?
              </Text>
              <TextInput
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={supportMessage}
                onChangeText={setSupportMessage}
                style={styles.input}
              />
              <TouchableOpacity style={styles.mainBtn} onPress={handleSendSupport}>
                <Text>Send</Text>
              </TouchableOpacity>
            </>
            )}

            {activeMenu === "Language" && (
              <>
                <TouchableOpacity onPress={() => changeLanguage("en")}>
                  <Text style={styles.modalText}>🇬🇧 English</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("it")}>
                  <Text style={styles.modalText}>🇮🇹 Italiano</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("es")}>
                  <Text style={styles.modalText}>🇪🇸 Español</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("fr")}>
                  <Text style={styles.modalText}>🇫🇷 Français</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("de")}>
                  <Text style={styles.modalText}>🇩🇪 Deutsch</Text>
                </TouchableOpacity>
              </>
            )}

            {activeMenu === "Messages" && (
              <Text style={styles.modalText}>Messages (coming soon)</Text>
            )}

            {/* ===== MY ACCOUNT MODAL ===== */}
            {activeMenu === "My account" && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <TouchableOpacity
                    onPress={() => setActiveMenu(null)}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>

                  {!user && (
                    <>
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        Welcome to Jenesis AI
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        Create stunning content with the help of AI
                      </Text>

                      <TouchableOpacity style={styles.authBtn} onPress={handleGoogleLogin}>
                        <Text style={styles.authText}>Continue with Google</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.authBtn} onPress={handleAppleLogin}>
                        <Text style={styles.authText}>Continue with Apple</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.authBtn} onPress={handleMicrosoftLogin}>
                        <Text style={styles.authText}>Continue with Microsoft</Text>
                      </TouchableOpacity>

                      <Text style={styles.orText}>OR</Text>

                      <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                      />

                      <View
                        style={[
                          styles.input,
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 0,
                          },
                        ]}
                      >
                        <TextInput
                          style={{ color: "#fff", flex: 1, paddingVertical: 14 }}
                          placeholder="Password"
                          placeholderTextColor="#aaa"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={{ paddingHorizontal: 10 }}
                        >
                          <Text style={{ fontSize: 18 }}>
                            {showPassword ? "👁️" : "🙈"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity onPress={handleResetPassword}>
                        <Text style={styles.resetText}>Reset password</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Login</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenu(null);
                          setTimeout(() => setIsSignUpModalVisible(true), 150);
                        }}
                      >
                        <Text style={styles.signupText}>Sign up →</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {user && (
                    <>
                      <Text style={styles.modalTitle}>My Account</Text>
                      <Text style={styles.modalSubtitle}>{user.email}</Text>
                      <Text style={styles.modalSubtitle}>
                        Login with: {user.provider}
                      </Text>

                      <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
                        <Text style={{ color: "#fff" }}>Logout</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* SIGN UP MODAL */}
      <Modal
        visible={isSignUpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSignUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: "#000", borderWidth: 1, borderColor: "#333" },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setIsSignUpModalVisible(false);
                setTimeout(() => setActiveMenu("My account"), 150);
              }}
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#a855f7", fontSize: 18, marginRight: 5 }}>
                ‹
              </Text>
              <Text style={{ color: "#a855f7", fontSize: 16, fontWeight: "500" }}>
                Back
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Create Account</Text>
            <Text style={styles.modalSubtitle}>Join Jenesis AI today</Text>

            <View style={styles.socialBtnRow}>
              <TouchableOpacity
                style={[styles.socialBtn, styles.googleBorder]}
                onPress={handleGoogleLogin}
              >
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, styles.appleBorder]}
                onPress={handleAppleLogin}
              >
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, styles.microsoftBorder]}
                onPress={handleMicrosoftLogin}
              >
                <Text style={styles.socialText}>Microsoft</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.orText}>OR USE EMAIL</Text>

            <View style={[styles.input, { flexDirection: "row", alignItems: "center" }]}>
              <Text style={{ marginRight: 10, fontSize: 18 }}>✉️</Text>
              <TextInput
                style={{ color: "#fff", flex: 1, paddingVertical: 12 }}
                placeholder="Email address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.input, { flexDirection: "row", alignItems: "center", marginTop: 15 }]}>
              <Text style={{ marginRight: 10, fontSize: 18 }}>🔒</Text>
              <TextInput
                style={{ color: "#fff", flex: 1, paddingVertical: 12 }}
                placeholder="New password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "🙈"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: "#a855f7", marginTop: 15 }]}
              onPress={handleSignUp}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.topIcon}>☰</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => router.push("/buyCredits")}>
            <Text style={styles.topIcon}>🎁</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.unlimitedBtn} onPress={() => router.push("/buyCredits")}>
            <Text style={styles.unlimitedText}>Go Unlimited</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HOME */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Animated.Image
            source={HERO_IMAGES[heroImageIndex]}
            style={[styles.heroImage, { opacity: heroFade }]}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Jenesis AI✨</Text>
            <Text style={styles.heroSubtitle}>{heroMessages[heroIndex]}</Text>
          </View>
        </View>

        {/* MAIN CTA */}
        <TouchableOpacity style={styles.mainCta} onPress={() => router.push("/create")}>
          <Text style={styles.mainCtaText}>🎬 Crea il tuo primo video</Text>
        </TouchableOpacity>

        {/* BADGES */}
        <View style={styles.badges}>
          <Text style={styles.badge}>🔥 Trend di oggi</Text>
          <Text style={styles.badge}>⭐ Più usato</Text>
          <Text style={styles.badge}>🚀 Nuovi template</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/create?type=video")}>
            <Text style={styles.actionTitle}>🎬 AI Video</Text>
            <Text style={styles.actionText}>Crea video virali</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/create?type=image")}>
            <Text style={styles.actionTitle}>🖼️ AI Image</Text>
            <Text style={styles.actionText}>Immagini creative</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/create?type=effects")}>
            <Text style={styles.actionTitle}>🔥 Effects</Text>
            <Text style={styles.actionText}>Effetti dinamici</Text>
          </TouchableOpacity>
        </View>

        {/* TRENDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trend</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(CATEGORIES).map(([key, images]) => (
              <TouchableOpacity
                key={key}
                style={styles.trendCard}
               onPress={() => {
               if (key === "calcio") return;

                router.push({
                pathname: "/explore",
                params: { category: key },
                 });
              }}
              >
                {key === "calcio" && (
  <View style={styles.comingSoonBadge}>
    <Text style={styles.comingSoonText}>Coming Soon🚀</Text>
  </View>
)}
                <Image source={images[imageIndex]} style={styles.trendImage} />
                <Text style={styles.trendText}>
                  {key === "calcio" ? "Calcio ⚽️" : key}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={() => router.push("/buyCredits")}>
          <Text style={styles.ctaText}>💎 Ottieni Crediti</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

/* ===== STYLES (IDENTICI + MODALE) ===== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
  },

  topIcon: { fontSize: 26, color: "#fff" },

  unlimitedBtn: {
    backgroundColor: "#a78bfa",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  unlimitedText: { color: "#1e1b4b", fontWeight: "bold" },

  hero: {
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    margin: 16,
  },

  heroImage: { width: "100%", height: "100%" },

  heroOverlay: {
    position: "absolute",
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: "100%",
  },

  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  heroSubtitle: { color: "#dcdcff", marginTop: 6 },

  mainCta: {
    backgroundColor: "#7c3aed",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  mainCtaText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  badges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 24,
  },

  actionCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 16,
    width: "31%",
  },

  actionTitle: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  actionText: { color: "#c7c7ff", fontSize: 12, marginTop: 6 },

  section: { marginTop: 30, marginLeft: 16 },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  trendCard: { marginRight: 14 },

  trendImage: { width: 140, height: 180, borderRadius: 16 },

  trendText: { color: "#fff", marginTop: 6, textAlign: "center" },

  cta: {
    backgroundColor: "#6C5CE7",
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  ctaText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  drawer: {
    position: "absolute",
    top: 90,
    left: 16,
    backgroundColor: "#1B1464",
    borderRadius: 16,
    padding: 12,
    zIndex: 999,
    width: "70%",
  },

  drawerText: { color: "#fff", fontSize: 14 },

  modalText: { color: "#fff", marginVertical: 8 },

  input: {
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: "#fff",
    marginVertical: 10,
  },

  mainBtn: {
    backgroundColor: "#7c3aed",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  drawerItem: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  drawerItemDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#0B0F2F",
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: -60 }],
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },

  modalSubtitle: {
    color: "#aaa",
    marginBottom: 8,
    textAlign: "center",
  },

  authBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  authText: { color: "#fff", textAlign: "center" },

  orText: { color: "#777", textAlign: "center", marginVertical: 14 },

  resetText: { color: "#9CA3FF", textAlign: "right", marginBottom: 14 },

  loginBtn: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  signupText: { color: "#9CA3FF", textAlign: "center", marginTop: 14 },

  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  socialBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingVertical: 10,
    width: "31%",
  },

  googleBorder: { borderColor: "#4285F4" },
  appleBorder: { borderColor: "#fff" },
  microsoftBorder: { borderColor: "#F25022" },

  socialText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  //*-------COMING SOON------*//
  comingSoonBadge: {
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: "rgba(0,0,0,0.7)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  zIndex: 10,
},

comingSoonText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
},
});