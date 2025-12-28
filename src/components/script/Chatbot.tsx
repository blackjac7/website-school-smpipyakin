"use client";

import dynamic from "next/dynamic";

const BubbleChat = dynamic(
  () => import("flowise-embed-react").then((mod) => mod.BubbleChat),
  {
    ssr: false,
    loading: () => <div>Loading chatbot...</div>,
  }
);

const Chatbot = () => {
  return (
    <BubbleChat
      chatflowid={
        process.env.NEXT_PUBLIC_FLOWISE_CHATFLOW_ID ||
        "79c764d6-ef03-4796-9885-cbdef2c0d903"
      }
      apiHost={
        process.env.NEXT_PUBLIC_FLOWISE_API_URL || "https://flowise.zeabur.app"
      }
      theme={{
        button: {
          backgroundColor: "#3B81F6",
          right: 20,
          bottom: 20,
          size: "medium",
          dragAndDrop: true,
          iconColor: "white",
          customIconSrc: "avatarAI.png",
          autoWindowOpen: {
            autoOpen: false,
            openDelay: 2,
            autoOpenOnMobile: false,
          },
        },
        tooltip: {
          showTooltip: true,
          tooltipMessage: "Haii Pengunjung👋 Selamat Datang!",
          tooltipBackgroundColor: "rgba(0, 0, 0, 0.8)",
          tooltipTextColor: "white",
          tooltipFontSize: 16,
        },
        chatWindow: {
          showTitle: true,
          title: "SMP IP Yakin AI Chatbot",
          titleAvatarSrc: "logo.png",
          showAgentMessages: true,
          welcomeMessage:
            "Haloo.. Selamat datang di website sekolah kami! Ada yang bisa aku bantu?",
          errorMessage: "Maaf, sistem chat sedang bermasalah.",
          backgroundColor: "#ffffff",
          backgroundImage: "enter image path or link",
          height: 550,
          width: 400,
          fontSize: 16,
          starterPromptFontSize: 15,
          clearChatOnReload: true,
          botMessage: {
            backgroundColor: "#f7f8ff",
            textColor: "#303235",
            showAvatar: true,
            avatarSrc: "avatarAI.png",
          },
          userMessage: {
            backgroundColor: "#3B81F6",
            textColor: "#ffffff",
            showAvatar: true,
            avatarSrc:
              "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png",
          },
          textInput: {
            placeholder: "Type your question",
            backgroundColor: "#ffffff",
            textColor: "#303235",
            sendButtonColor: "#3B81F6",
            maxChars: 50,
            maxCharsWarningMessage:
              "You exceeded the characters limit. Please input less than 50 characters.",
            autoFocus: true,
            sendMessageSound: true,
            receiveMessageSound: true,
          },
          feedback: {
            color: "#303235",
          },
          footer: {
            textColor: "#303235",
            text: "Developed by",
            company: "SMP IP Yakin Jakarta",
            companyLink: "https://www.smpipyakin.sch.id",
          },
        },
      }}
    />
  );
};

export default Chatbot;
