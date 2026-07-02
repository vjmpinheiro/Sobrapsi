import { NextRequest, NextResponse } from "next/server";
import { getCandidateContact } from "@/lib/application-guest";
import {
  getApplicationForUser,
  processApplicationReceived,
  requiredDocumentsForCategory,
} from "@/lib/applications";
import {
  sendApplicationReceivedEmail,
  sendNewApplicationAdminNotification,
} from "@/lib/email";
import { getSession } from "@/lib/auth";
import { getCandidateSession } from "@/lib/candidate-auth";
import { CATEGORY_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const userSession = await getSession();
    const candidateSession = await getCandidateSession();
    const { applicationId } = await request.json();

    let application = null;

    if (userSession) {
      application = await getApplicationForUser(userSession.userId, applicationId);
    } else if (candidateSession?.applicationId === applicationId) {
      application = await prisma.application.findUnique({
        where: { id: applicationId, userId: null },
        include: {
          documents: true,
          candidate: true,
          user: { include: { person: true } },
        },
      });
    }

    if (!application) {
      return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
    }

    if (!["draft", "awaiting_complement"].includes(application.status)) {
      return NextResponse.json({ error: "Candidatura já enviada" }, { status: 400 });
    }

    const contact = getCandidateContact(application);
    if (!contact?.fullName) {
      return NextResponse.json(
        { error: "Complete os dados pessoais antes de enviar" },
        { status: 400 }
      );
    }

    const cpf =
      application.candidate?.cpfEncrypted ?? application.user?.person?.cpfEncrypted;
    if (!cpf) {
      return NextResponse.json(
        { error: "Complete os dados pessoais antes de enviar" },
        { status: 400 }
      );
    }

    const required = requiredDocumentsForCategory(application.categoryRequested);
    const uploadedTypes = application.documents.map((d) => d.documentType);
    const missing = required.filter((t) => !uploadedTypes.includes(t));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Documentos pendentes: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const wasComplement = application.status === "awaiting_complement";

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: wasComplement ? "complemented" : "submitted",
        submittedAt: new Date(),
        currentStep: 6,
      },
    });

    await processApplicationReceived(applicationId);

    await sendApplicationReceivedEmail(contact.email, contact.fullName);
    await sendNewApplicationAdminNotification(
      applicationId,
      contact.fullName,
      CATEGORY_LABELS[application.categoryRequested]
    );

    return NextResponse.json({
      application: updated,
      message: "Candidatura enviada com sucesso",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao enviar candidatura" }, { status: 500 });
  }
}
