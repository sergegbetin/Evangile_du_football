# Kogoh — Plateforme Tournoi

Plateforme web pour le tournoi **L'Évangile selon le Football** (Édition Vacances 2026), développée avec Next.js 14, Supabase et shadcn/ui.

## Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com)
- npm

## Configuration Supabase

### 1. Créer un projet Supabase

1. Créez un nouveau projet sur [supabase.com](https://supabase.com/dashboard)
2. Notez l'URL du projet et les clés API (anon + service role)

### 2. Exécuter la migration

Dans le SQL Editor de Supabase, exécutez dans l'ordre :

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_security_and_integrity.sql
```

(La migration 002 est idempotente pour les bases déjà créées avec 001 seul.)

Cette migration crée :

- Tables : `profiles`, `teams`, `roster_members`, `matches`, `payments`, `claims`, `documents`, `audit_logs`
- Enums : rôles (`coach`, `committee`, `referee`, `discipline`, `super_admin`), statuts équipe, etc.
- RLS (Row Level Security) pour chaque table
- Trigger `handle_new_user` — crée un profil à l'inscription
- Trigger `generate_payment_receipt_number` — génère les reçus `PAY-2026-XXXXXX`
- Limites effectif : 16 membres max, 12 joueurs max

### 3. Configurer l'authentification

Dans Supabase → Authentication → URL Configuration :

- **Site URL** : `http://localhost:3000` (dev)
- **Redirect URLs** : `http://localhost:3000/auth/callback`

Désactivez **Confirm email** en développement (Authentication → Providers → Email).

### 4. Variables d'environnement

```bash
cp .env.example .env.local
```

Renseignez les 3 clés depuis Supabase → Project Settings → API.

### 5. Vérifier la connexion et seed

```bash
npm run check:supabase
npm run setup:supabase
```

Ou en une commande :

```bash
npm run setup:supabase
```

Identifiants : voir **[IDENTIFIANTS.md](./IDENTIFIANTS.md)**

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Coach | `coach@kogoh.bj` | `Coach2026!` |
| Comité | `comite@kogoh.bj` | `Comite2026!` |

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
```

## Lancer en développement

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Structure

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Accueil |
| `/calendrier` | Public | Calendrier des matchs |
| `/classement` | Public | Classement |
| `/documents` | Public | Documents officiels |
| `/connexion` | Public | Connexion |
| `/inscription` | Public | Inscription coach |
| `/dashboard` | Auth | Tableau de bord coach |
| `/dashboard/equipe` | Coach | Inscription équipe |
| `/dashboard/effectif` | Coach | Gestion effectif |
| `/dashboard/paiements` | Coach | Statut paiements (lecture seule) |
| `/dashboard/reclamations` | Coach | Réclamations |
| `/admin/equipes` | Comité | Validation équipes |
| `/admin/paiements` | Comité | Enregistrement paiements manuels |
| `/admin/calendrier` | Comité | Création matchs |
| `/admin/reclamations` | Comité | Traitement réclamations |

## Constantes tournoi

Définies dans `src/lib/constants.ts` :

- 8 équipes max, 12 joueurs / 16 membres effectif max
- Présence : 1 h avant le match ; retard 15 min : 2 000 FCFA
- Frais : 5 000 FCFA inscription + 10 000 FCFA participation
- Couleur marque : `#1A3A6B` (bleu marine)

## Build production

```bash
npm run build
npm start
```

## Déploiement

Compatible Vercel, Render ou tout hébergeur Node.js. Configurez les variables d'environnement et mettez à jour les URLs de redirection Supabase pour votre domaine de production.
# Evangile_du_football
