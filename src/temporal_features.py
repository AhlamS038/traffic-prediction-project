import pandas as pd
def create_temporal_features(df, date_column='date_time'):
    """
    Crée toutes les features temporelles pour le dataset de trafic.
    
    Cette fonction extrait automatiquement :
    - Les composantes de la date (année, mois, jour, heure)
    - Les indicateurs temporels (weekend, rush hour, holidays)
    - Les périodes (saison, moment de la journée)
    
    Parameters:
    -----------
    df : pd.DataFrame
        Dataset contenant la colonne de dates/heures
    date_column : str, default='date_time'
        Nom de la colonne contenant les timestamps
    
    Returns:
    --------
    df : pd.DataFrame
        Dataset enrichi avec 11 nouvelles colonnes temporelles
    """
    
    df = df.copy() 
    df[date_column] = pd.to_datetime(df[date_column])
    
    print("Extraction des composantes temporelles:")
    df['year'] = df[date_column].dt.year
    df['month'] = df[date_column].dt.month
    df['day'] = df[date_column].dt.day
    df['hour'] = df[date_column].dt.hour
    df['day_of_week'] = df[date_column].dt.dayofweek 
    df['week_of_year'] = df[date_column].dt.isocalendar().week

  
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
 
    # Heures identifiées comme heures de pointe : 7h, 8h, 15h, 16h, 17h, 18h
    df['is_rush_hour'] = df['hour'].isin([7, 8, 15, 16, 17, 18]).astype(int)
    
 
    def get_time_of_day(hour):
        if 6 <= hour < 12:
            return 'Matin'
        elif 12 <= hour < 18:
            return 'Après-midi'
        elif 18 <= hour < 22:
            return 'Soir'
        else:
            return 'Nuit'
    
    df['time_of_day'] = df['hour'].apply(get_time_of_day)
    
    def get_season(month):
        if month in [3, 4, 5]:
            return 'Printemps'
        elif month in [6, 7, 8]:
            return 'Été'
        elif month in [9, 10, 11]:
            return 'Automne'
        else:
            return 'Hiver'
    
    df['season'] = df['month'].apply(get_season)
    

    us_holidays = [
    # 2012
    '2012-01-02', # New Year's Day (observed)
    '2012-01-16', # Martin Luther King Jr. Day
    '2012-02-20', # Washington’s Birthday
    '2012-05-28', # Memorial Day
    '2012-07-04', # Independence Day
    '2012-09-03', # Labor Day
    '2012-10-08', # Columbus Day
    '2012-11-12', # Veterans Day (observed)
    '2012-11-22', # Thanksgiving
    '2012-12-25', # Christmas

    # 2013
    '2013-01-01', # New Year's Day
    '2013-01-21', # MLK Day
    '2013-02-18', # Washington’s Birthday
    '2013-05-27', # Memorial Day
    '2013-07-04', # Independence Day
    '2013-09-02', # Labor Day
    '2013-10-14', # Columbus Day
    '2013-11-11', # Veterans Day
    '2013-11-28', # Thanksgiving
    '2013-12-25', # Christmas

    # 2014
    '2014-01-01',
    '2014-01-20',
    '2014-02-17',
    '2014-05-26',
    '2014-07-04',
    '2014-09-01',
    '2014-10-13',
    '2014-11-11',
    '2014-11-27',
    '2014-12-25',

    # 2015
    '2015-01-01',
    '2015-01-19',
    '2015-02-16',
    '2015-05-25',
    '2015-07-03', # Observed
    '2015-09-07',
    '2015-10-12',
    '2015-11-11',
    '2015-11-26',
    '2015-12-25',

    # 2016
    '2016-01-01',
    '2016-01-18',
    '2016-02-15',
    '2016-05-30',
    '2016-07-04',
    '2016-09-05',
    '2016-10-10',
    '2016-11-11',
    '2016-11-24',
    '2016-12-26', # Christmas observed

    # 2017
    '2017-01-02',
    '2017-01-16',
    '2017-02-20',
    '2017-05-29',
    '2017-07-04',
    '2017-09-04',
    '2017-10-09',
    '2017-11-10', # Veterans Day observed
    '2017-11-23',
    '2017-12-25',

    # 2018
    '2018-01-01',
    '2018-01-15',
    '2018-02-19',
    '2018-05-28',
    '2018-07-04',
    '2018-09-03',
    '2018-10-08',
    '2018-11-12',
    '2018-11-22',
    '2018-12-25',
]

    
    df['date'] = df[date_column].dt.date
    df['is_holiday'] = df['date'].astype(str).isin(us_holidays).astype(int)
    df.drop('date', axis=1, inplace=True)
    
    return df


def display_feature_summary(df):
    """
    Affiche un résumé des features temporelles créées.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Dataset avec les features temporelles
    """
    temporal_cols = ['year', 'month', 'day', 'hour', 'day_of_week', 
                     'week_of_year', 'is_weekend', 'is_rush_hour', 
                     'time_of_day', 'season', 'is_holiday']
    
    print("RÉSUMÉ DES FEATURES TEMPORELLES")
    
    for col in temporal_cols:
        if col in df.columns:
            if df[col].dtype == 'object': 
                unique_values = df[col].unique()
                print(f"{col:20s} : {len(unique_values)} valeurs uniques → {list(unique_values)[:5]}")
            else:
                print(f"{col:20s} : min={df[col].min()}, max={df[col].max()}")
