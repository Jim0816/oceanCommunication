from DBmanage import DBManage
import json

def main():
    for i in range(10):
        res = DBManage.get_ABC_data(sec=i + 1)
        with open('app/test/data/{}.json'.format(i), 'w', encoding='utf-8') as f:
            json.dump(res, f)
    

if __name__ == "__main__":
    # DBManage._test_insert_ABC()
    main()
