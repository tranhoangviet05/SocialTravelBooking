
import os

file_path = r'd:\K23_23-27\Ki6\DoAnChuyenNganh1\SocialTravelBooking\frontend_web\src\pages\provider\MyServices.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the map end area around 1250-1280
# We know line 1258 is the delete button
target_found = False
for i in range(len(lines)):
    if 'setConfirmDelete({ id: service.id, name: service.name })' in lines[i]:
        # This is line 1258 (0-indexed 1257)
        # We need to replace everything from the next line until the map end
        # We'll just rebuild the whole block from 1258 to 1268
        
        start_idx = i - 0 # Stay on the button line
        # Find where the map ends or where the next div starts
        # Based on view_file, line 1268 was </div>
        # But let's just find the next 'Pagination' or something stable
        end_idx = -1
        for j in range(i, min(i + 30, len(lines))):
            if 'Pagination' in lines[j]:
                end_idx = j
                break
        
        if end_idx != -1:
            new_block = [
                lines[i], # Button line
                '                                                            <Trash2 size={15} />\n',
                '                                                            <span className="text-[9px] font-bold leading-none">Xóa</span>\n',
                '                                                        </button>\n',
                '                                                    </div>\n',
                '                                                )}\n',
                '                                            </div>\n',
                '                                        </div>\n',
                '                                    </div>\n',
                '                                );\n',
                '                            })}\n',
                '                        </div>\n',
                '\n' # Empty line before pagination
            ]
            
            lines[i:end_idx] = new_block
            target_found = True
            break

if target_found:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully fixed MyServices.jsx")
else:
    print("Could not find the target line")
