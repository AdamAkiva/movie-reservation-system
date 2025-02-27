CREATE TABLE "genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "genre_unique_constraint" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hall" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"rows" smallint NOT NULL,
	"columns" smallint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hall_unique_constraint" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "movie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"genre_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_poster" (
	"movie_id" uuid PRIMARY KEY NOT NULL,
	"absolute_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_in_bytes" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_unique_constraint" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "showtime" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp (3) with time zone NOT NULL,
	"movie_id" uuid NOT NULL,
	"hall_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "showtime_unique_constraint" UNIQUE("at","hall_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"hash" text NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_unique_constraint" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_showtime" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"row" smallint NOT NULL,
	"column" smallint NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" text,
	"showtime_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_showtime_unique_constraint" UNIQUE("row","column","showtime_id")
);
--> statement-breakpoint
ALTER TABLE "movie" ADD CONSTRAINT "movie_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "movie_poster" ADD CONSTRAINT "movie_poster_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "showtime" ADD CONSTRAINT "showtime_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "showtime" ADD CONSTRAINT "showtime_hall_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."hall"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_showtime" ADD CONSTRAINT "user_showtime_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_showtime" ADD CONSTRAINT "user_showtime_showtime_id_fk" FOREIGN KEY ("showtime_id") REFERENCES "public"."showtime"("id") ON DELETE cascade ON UPDATE cascade;