"""
Module de création des features météorologiques pour l'analyse du trafic.
"""

import pandas as pd
import numpy as np


def create_weather_features(df):
    """
    Crée toutes les features météorologiques pour le dataset de trafic.
    
    Features créées :
    -----------------
    - is_raining : Indicateur de pluie (0 ou 1)
    - is_snowing : Indicateur de neige (0 ou 1)
    - temp_level : Niveau de température (Très Froid, Froid, Frais, Agréable, Chaud)
    - cloud_category : Catégorie de couverture nuageuse
    
    Parameters:
    -----------
    df : pd.DataFrame
        Dataset contenant les colonnes météo (temp_celsius, rain_1h, snow_1h, clouds_all)
    
    Returns:
    --------
    df : pd.DataFrame
        Dataset enrichi avec les nouvelles features météo
    """
    
    df = df.copy()

    print("Création de 'is_raining' et 'is_snowing' :")
    df['is_raining'] = (df['rain_1h'] > 0).astype(int)
    df['is_snowing'] = (df['snow_1h'] > 0).astype(int)

    print("Création de 'temp_level':")
    
    def get_temp_level(temp_celsius):
        if temp_celsius < 0:
            return 'Très Froid'
        elif 0 <= temp_celsius < 10:
            return 'Froid'
        elif 10 <= temp_celsius < 20:
            return 'Frais'
        elif 20 <= temp_celsius < 25:
            return 'Agréable'
        else:
            return 'Chaud'
    
    df['temp_level'] = df['temp_celsius'].apply(get_temp_level)
    
    print("Création de 'cloud_category':")
    
    def get_cloud_category(clouds_pct):
        if clouds_pct == 0:
            return 'Ciel Dégagé'
        elif 1 <= clouds_pct <= 25:
            return 'Peu Nuageux'
        elif 26 <= clouds_pct <= 50:
            return 'Partiellement Nuageux'
        elif 51 <= clouds_pct <= 75:
            return 'Nuageux'
        else:
            return 'Très Nuageux'
    
    df['cloud_category'] = df['clouds_all'].apply(get_cloud_category)
    
    print(f"Feature engineering météo terminé ! {len(df.columns)} colonnes au total.")
    return df
