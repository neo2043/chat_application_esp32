#ifndef STATICARRAY_H
#define STATICARRAY_H

template <typename T>
class staticArray{
    private:
        T array[20];
        int top=-1;
    public:
        int indexOf(T element){
            for(int i=0;i<=top;i++){
                if(element==array[i]){
                    return i;
                }
            }
            return -1;
        }
        T atIndex(int index){
            return array[index];
        }
        void add(T element){
            if(top<=19){
                top++;
                array[top]=element;
            }
            else{
                Serial.println("Overflow");
            }
        }
        void removeByIndex(int index){
            for(int i=0;i<=top;i++){
                if(i>index){
                    array[i-1]=array[i];
                }
            }
            top--;
        }
        bool contains(T element){
            return indexOf(element)==-1?false:true;
        }
        void printArray(){
            for(int i=0;i<=top;i++){
                Serial.printf("at index: %d %d\n",i,array[i]);
            }
        }
        int size(){
            return top;
        }
};

#endif