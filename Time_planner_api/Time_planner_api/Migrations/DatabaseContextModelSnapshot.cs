﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Time_planner_api.Models;

namespace Time_planner_api.Migrations
{
    [DbContext(typeof(DatabaseContext))]
    partial class DatabaseContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.9")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Time_planner_api.Models.Event", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("City")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsPublic")
                        .HasColumnType("bit");

                    b.Property<int?>("OwnerId")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("StreetAddress")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("OwnerId");

                    b.ToTable("Events");
                });

            modelBuilder.Entity("Time_planner_api.Models.ListCategory", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Category")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("OwnerId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("OwnerId");

                    b.ToTable("ListCategories");
                });

            modelBuilder.Entity("Time_planner_api.Models.Notification", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("EventId")
                        .HasColumnType("int");

                    b.Property<bool>("IsDismissed")
                        .HasColumnType("bit");

                    b.Property<int>("MessageType")
                        .HasColumnType("int");

                    b.Property<int?>("ReceiverId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("EventId");

                    b.HasIndex("ReceiverId");

                    b.ToTable("Notifications");
                });

            modelBuilder.Entity("Time_planner_api.Models.Task", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CategoryId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("EndDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsDone")
                        .HasColumnType("bit");

                    b.Property<int>("Priority")
                        .HasColumnType("int");

                    b.Property<DateTime?>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.ToTable("Tasks");
                });

            modelBuilder.Entity("Time_planner_api.Models.User", b =>
                {
                    b.Property<int>("FacebookId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.HasKey("FacebookId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Time_planner_api.Models.WeatherForecast", b =>
                {
                    b.Property<string>("Date")
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Summary")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<int>("TemperatureC")
                        .HasColumnType("int");

                    b.Property<int>("TemperatureF")
                        .HasColumnType("int");

                    b.HasKey("Date");

                    b.ToTable("WeatherForecasts");
                });

            modelBuilder.Entity("Time_planner_api.Models.Event", b =>
                {
                    b.HasOne("Time_planner_api.Models.User", "Owner")
                        .WithMany("AttendedEvents")
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("Time_planner_api.Models.ListCategory", b =>
                {
                    b.HasOne("Time_planner_api.Models.User", "Owner")
                        .WithMany("OwnedTaskCategories")
                        .HasForeignKey("OwnerId");
                });

            modelBuilder.Entity("Time_planner_api.Models.Notification", b =>
                {
                    b.HasOne("Time_planner_api.Models.Event", "Event")
                        .WithMany("Notifications")
                        .HasForeignKey("EventId");

                    b.HasOne("Time_planner_api.Models.User", "Receiver")
                        .WithMany("Notifications")
                        .HasForeignKey("ReceiverId");
                });

            modelBuilder.Entity("Time_planner_api.Models.Task", b =>
                {
                    b.HasOne("Time_planner_api.Models.ListCategory", "Category")
                        .WithMany("Tasks")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
