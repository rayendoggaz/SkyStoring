import sqlite3
import operation_db


mabase = operation_db.creer_db()
baseDonn, cur = operation_db.connect_db(mabase)
while 1:
    print("Veuillez entrer votre requête SQL (ou <Enter> pour terminer) :")
    requete = input()
    if requete =="":
        break
    try:
        cur.execute(requete) # exécution de la requête SQL
    except:
        print('*** Requête SQL incorrecte ***')
    else:
        for enreg in cur: # Affichage du résultat
            print(enreg)
    print()
    choix = input("Confirmez-vous l'enregistrement de l'état actuel (o/n) ? ")
    if choix[0] == "o" or choix[0] == "O":
        baseDonn.commit()
    else:
        baseDonn.close()


cur.close()
conn.close()