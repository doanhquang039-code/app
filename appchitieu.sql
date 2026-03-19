Create database ExpenseTrackerDB;
Use  ExpenseTrackerDB;
create table Users(
id int primary key identity(1,1),
email NVARCHAR(255) not null unique,
password NVARCHAR(255) not null,
fullName NVARCHAR(255) not null,
createdAt Datetime2 default getdate()
);
create table Wallets(
id int primary key identity(1,1),
userId int not null,
name Nvarchar(255) not null,
balance decimal(18,2) default 0,
icon NVARCHAR(255),
createdAt datetime2 default getdate(),
 FOREIGN KEY (userId) REFERENCES Users(id)
);
create table categories(
id int primary key identity(1,1),
userId int not null,
name nvarchar(255) not null,
icon Nvarchar(255) not null,
type Nvarchar(255) not null check(type IN('income','expense')),
FOREIGN KEY (userId) REFERENCES Users(id)
);
create table Transactions(
id int primary key identity(1,1),
userId int not null,
walletId int not null,
categoryId int not null,
amount Decimal(10,2) not null,
date datetime2 not null,
createAt datetime2 default getdate()
foreign key(userId) references Users(id),
foreign key(walletId) references Wallets(id),
foreign key(categoryId) references Categories(id)
);